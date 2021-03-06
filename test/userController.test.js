/* eslint-disable no-undef */
const userController = require('../Controller/userController');
const mockReq = require('sinon-express-mock').mockReq;
const mockRes = require('sinon-express-mock').mockRes;
const expect = require('chai').expect;
const mongoose = require('mongoose');
const config = require('../Config/config');
const options = { useNewUrlParser: true, useUnifiedTopology: true }
const user = require('../Model/userModel');

// O ideial seria criar outro BD para os Testes.
mongoose.connect(config.bd_url, options);
mongoose.set('useCreateIndex', true);
mongoose.connection.on('connected', () => {
    console.log('Aplicação conectada ao banco de dados!\n');
});


describe('userController', function () {
    this.timeout(100000000);

    this.beforeEach(async () => {
        await user.create({
            nome: 'test',
            email: 'teste@hotmail.com',
            senha: '123456',
            telefones: [{ numero: '999999999', ddd: '11' }],
            dateInformation: {
                creationDate: new Date,
                updateDate: new Date,
                lastLoginDate: new Date,
            },
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RlQGhvdG1haWwuY29tIiwiaWF0IjoxNTgzMjY3MzgyLCJleHAiOjE1ODMyNzA5ODJ9.jeO8d4q8kTsbWLctxpu_3LfsWib-w3iOCeP4QCT4wkg'
        });
    });
    this.afterEach(async () => {
        await user.remove({});
    });
    this.afterAll(async () => {
        await mongoose.connection.close();
    });
    //----------------------------------------------------------------------------------------------------------
    describe('sign-up', function () {
        it('should return status code 201 when user was created', async function () {
            const request = {
                body: {
                    nome: 'teste2',
                    email: 'teste2@hotmail.com',
                    senha: '123456',
                    telefones: [{
                        numero: '999999999',
                        ddd: '11'
                    }]
                }
            }
            const req = mockReq(request);
            const res = mockRes();
            await userController.signUp(req, res);
            expect(res.status.calledWith(201)).to.be.equal(true);
        });
        it('should return status code 400 when to realize there are no senha', async function () {
            const request = {
                body: {
                    nome: 'teste2',
                    email: 'teste2@hotmail.com',
                    randomnumber: '123456',
                    telefones: [{
                        numero: '999999999',
                        ddd: '11'
                    }]
                }
            }
            const req = mockReq(request);
            const res = mockRes();
            await userController.signUp(req, res);
            expect(res.status.calledWith(400)).to.be.equal(true);
        });
    });
    //----------------------------------------------------------------------------------------------------------
    describe('sign-in', function () {

        it('should return status code 200 when sign in was successful', async function () {
            const request = {
                body: {
                    email: 'teste@hotmail.com',
                    senha: '123456'
                },
            };
            const req = mockReq(request);
            const res = mockRes();
            await userController.signIn(req, res)
            expect(res.status.calledWith(200)).to.be.equal(true);
        });
        it('shouldnt return status code 500  when to realize there are no senha', async function () {
            const request = {
                body: {
                    email: 'teste@hotmail.com',
                    randomnumber: '123456'
                },
            };
            const req = mockReq(request);
            const res = mockRes();
            await userController.signIn(req, res);
            expect(res.status.calledWith(400)).to.be.equal(true);
        });
    });
    //----------------------------------------------------------------------------------------------------------

    describe('find-user', () => {
        it('should return status code 200 when find the user', async function () {
            const data = await user.findOne({ email: 'teste@hotmail.com' });
            const request = {
                query: {
                    id: data._id
                },
                headers: {
                    authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RlQGhvdG1haWwuY29tIiwiaWF0IjoxNTgzMjY3MzgyLCJleHAiOjE1ODMyNzA5ODJ9.jeO8d4q8kTsbWLctxpu_3LfsWib-w3iOCeP4QCT4wkg'
                },
            };
            const req = mockReq(request);

            const res = mockRes();
            await userController.findUser(req, res);
            expect(res.status.calledWith(200)).to.be.equal(true);
        });
        it('should return status code 401 when realize that is different token', async function () {
            const data = await user.findOne({ email: 'teste@hotmail.com' });
            const request = {
                query: {
                    id: data._id
                },
                headers: {
                    authorization: 'Bearer banana'
                },
            };
            const req = mockReq(request);

            const res = mockRes();
            await userController.findUser(req, res);
            expect(res.status.calledWith(401)).to.be.equal(true);
        });
        
        it('should return status code 500 when cant find the user', async function () {
            const request = {
                query: {
                    id: 'jsfpoasjfpsajfpas'
                },
            };
            const req = mockReq(request);
            const res = mockRes();
            await userController.findUser(req, res);

            expect(res.status.calledWith(500)).to.be.equal(true);
        });
    });
});