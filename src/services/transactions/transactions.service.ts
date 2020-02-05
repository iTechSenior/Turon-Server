import { PaymentStatus } from './../../interfaces/Payments';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Injectable } from '@nestjs/common';

import * as braintree from 'braintree';
import { Transactions } from '../../entities/transactions.entity';
import { Repository } from 'typeorm';
import * as _ from 'lodash';
import * as paypal from 'paypal-rest-sdk';
import * as uuidv1 from 'uuid/v1';
import { Payments } from '../../entities/payments.entity';

@Injectable()
export class TransactionsService {
    private gateway: any;
    constructor(
        @InjectRepository(Transactions) private readonly tranasctionsModel: Repository<Transactions>,        
        @InjectRepository(Payments) private readonly paymentsModel: Repository<Payments>,        
    ){
        this.gateway = new braintree.BraintreeGateway({
            environment: braintree.Environment.Sandbox,
            merchantId: 'tb7vjq2gvxq2krpj',
            publicKey: '4zwwnvsr5n8vwsxm',
            privateKey: '20e3c215e64f1a7d82c768bc9e79d80a'
        });

        paypal.configure({
            'mode': 'sandbox', //sandbox or live
            'client_id': 'ARC6ZHHgKmz4-4hUUTnr88V8IcBA21bI4SxuWYC-k4DGpft9mwvbd9CJRiT2nZNbkff2SOvjajfYBAJD',
            'client_secret': 'EK1ZKM0mQDP5TtLoKfpsWv_BV7KgHNyXMUKfcnYhSrXeQtkf-jNNlLxYqdazoDAoa-uNP1x84uDILz8d'
        });
    }

    async createToken(){
        return new Promise((resolve, reject) => {
            this.gateway.clientToken.generate({}, (err, response) => {
                if(err){
                    return reject(err);
                }

                if(response.success){
                    resolve(response.clientToken);
                }else{
                    reject(new Error('Something went wrong.'));
                }
            });
        })
    }

    async createTransaction(nonce, amount){
        return new Promise((resolve, reject) => {
            this.gateway.transaction.sale({
                amount,
                paymentMethodNonce: nonce,
                options: {
                    submitForSettlement: true
                }
            }, (err, result) => {
                if(err){
                    return reject(err);
                }

                resolve(result);
            });
        })
    }

    async createTransactionRecord(data: QueryDeepPartialEntity<Transactions>){
        return await this.tranasctionsModel.insert(data);
    }

    async getAllPayments(id: string, isStudent = false){
        if(isStudent){
            return await this.tranasctionsModel.find({userid: id});
        }
        return await this.tranasctionsModel.find({tutorid: id});
    }

    async getPayoutInfo(id: string){
        const payments = await this.tranasctionsModel.find({tutorid: id, status: PaymentStatus.Available});

        if(!payments.length){
            throw Error(`You don't have any available payments.`);
        }

        return {
            sum: _.reduce(payments, (sum, v) => sum += v.price, 0),
            payments: payments.length
        }
    }

    async requestPayout(id: string, email: string){
        const payments = await this.tranasctionsModel.find({tutorid: id, status: PaymentStatus.Available});

        if(!payments.length){
            throw Error(`You don't have any available payments.`);
        }

        let amount = _.reduce(payments, (sum, v) => sum += v.price, 0);

        const fees = Number.prototype.toFixed.call(amount / 5, 2);
        amount = (amount - fees);

        const payoutRequest = {
            sender_batch_header: {
                sender_batch_id: uuidv1(),
                email_subject: "Turon.co payout"
            },
            items: [
                {
                    recipient_type: "EMAIL",
                    amount: {
                        value: amount,
                        currency: "USD"
                    },
                    receiver: email,
                    note: "Turon.co payout",
                    sender_item_id: "item_3"
                }
            ]
        };

        const {batch_header} = await new Promise((resolve, reject) => {
            paypal.payout.create(payoutRequest, true, async (err, payout) => {
                if(err){
                    return reject(err);
                }

                await this.tranasctionsModel.update({tutorid: id, status: PaymentStatus.Available}, {status: PaymentStatus.Completed});

                resolve(payout);
            })
        })

        return {
            payout_batch_id: batch_header.payout_batch_id,
            amount: amount,
            fees: fees
        }
    }

    async createPaymentRecord(data: QueryDeepPartialEntity<Payments>){
        await this.paymentsModel.insert(data);
    }
}
