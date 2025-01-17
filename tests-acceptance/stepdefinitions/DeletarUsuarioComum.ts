import { defineSupportCode } from 'cucumber';
import { browser, $, element, ElementArrayFinder, by } from 'protractor';
let chai = require('chai').use(require('chai-as-promised'));
let expect = chai.expect;
var { setDefaultTimeout } = require("cucumber");

setDefaultTimeout(60 * 1000);

let sameId = ((elem, id) => elem.element(by.name('cpflist')).getText().then(text => text == id));
let sameUsername = ((elem, user) => elem.element(by.name('nomelist')).getText().then(text => text == user));

let pAND = ((p,q) => p.then(a => q.then(b => a && b)))

async function assertTamanhoEqual(set,n) {
    await set.then(elems => expect(Promise.resolve(elems.length)).to.eventually.equal(n));
}

async function login(user,passw){
    await element(by.id("login")).click();
    await browser.driver.sleep(1000);
    await preencher('UserSpace',user)
    await preencher('CpfBox', passw)
    await element(by.id("logButton")).click();
    await browser.driver.sleep(1000);
}
async function preencher(type, content) {
    if (type == 'UserSpace'){
        await $("input[name='UserSpace']").sendKeys(<string> content);
    }else
        if(type == 'CpfBox'){
            await $("input[name='CpfBox']").sendKeys(<string> content);
        }
}

defineSupportCode(function ({ Given, When, Then }) {
    Given(/^Eu estou logado como usuário adm "([^\"]*)" com senha "([^\"]*)"$/, async (user,passw) => {
        await browser.get("http://localhost:4200/home/news");
        await browser.driver.sleep(1000);
        expect((await browser.getCurrentUrl()).includes("http://localhost:4200/home/news"));
        await expect(browser.getTitle()).to.eventually.equal('ReviReli');
        if(await element(by.id("login")).isPresent()){
            await login(user,passw)
            expect (await element(by.id("profileEnter")).isPresent()).to.equal(true)
        }else{
            await element(by.id("profileEnter")).click();
            await browser.driver.sleep(1000);
            await element(by.id("logoutButton")).click();
            await browser.driver.sleep(1000);
            await login(user,passw)
            expect (await element(by.id("profileEnter")).isPresent()).to.equal(true)
        }

    })
    
    Given(/^Eu estou na pagina UsersManagement$/, async () => {
        await browser.driver.sleep(1000);
        await element(by.id("userTest")).click();
    });

    Given(/^O Usuário comum "([^\"]*)" com id "([^\"]*)" está cadastrado no sistema$/, async (user, id) => {
        await browser.driver.sleep(1000);
        await element(by.id("create2")).click();
        var allalunos : ElementArrayFinder = element.all(by.name('commonUserList'));
        var samecpfsandname = allalunos.filter(elem => pAND(sameId(elem,id),sameUsername(elem,user)));
        await assertTamanhoEqual(samecpfsandname,1);   
    });
    When(/^Eu tento remover o usuário comum "([^\"]*)" com id "([^\"]*)"$/, async (user, id) => {
        await browser.driver.sleep(1000);
        var allalunos : ElementArrayFinder = element.all(by.name('commonUserList'));
        var samecpfsandname = allalunos.filter(elem => pAND(sameId(elem,id),sameUsername(elem,user)))
        await samecpfsandname.map(elem => elem.element(by.name('delete1')).click())
        await browser.driver.sleep(1000); 
    });
    When(/^Eu confirmo a remocao do usuário comum "([^\"]*)" com id "([^\"]*)"$/, async (user, id) => {
        await element(by.buttonText("OK")).click();
    });

    Then(/^Nao consigo ver o usuário "([^\"]*)" com id "([^\"]*)"$/, async (user, id) => {
        var allalunos : ElementArrayFinder = element.all(by.name('commonUserList'));
        var samecpfsandname = allalunos.filter(elem => pAND(sameId(elem,id),sameUsername(elem,user)));
        await assertTamanhoEqual(samecpfsandname,0);  
    });

    //scenario 2
    Given(/^O Usuário comum "([^\"]*)" com id "([^\"]*)" não está cadastrado no sistema$/, async (user, id) => {
        var allalunos : ElementArrayFinder = element.all(by.name('commonUserList'));
        var samecpfsandname = allalunos.filter(elem => pAND(sameId(elem,id),sameUsername(elem,user)));
        await assertTamanhoEqual(samecpfsandname,0);   
    });
    
    When(/^Eu tento remover o usuário comum "([^\"]*)" com id "([^\"]*)" inexistente$/, async (user, id) => {
        await browser.driver.sleep(1000);
        var allalunos : ElementArrayFinder = element.all(by.name('commonUserList'));
        var samecpfsandname = allalunos.filter(elem => pAND(sameId(elem,id),sameUsername(elem,user)))
        await samecpfsandname.map(elem => expect(elem.element(by.name('delete1')).isPresent()).to.equal(false))
        
    });

    //scenario 3
    When(/^Eu cancelo a remocao do usuário comum "([^\"]*)" com id "([^\"]*)"$/, async (user, id) => {
        await element(by.buttonText("Cancel")).click();
    });
    Then(/^Eu consigo ver o usuário "([^\"]*)" com id "([^\"]*)"$/, async (user, id) => {
        var allalunos : ElementArrayFinder = element.all(by.name('commonUserList'));
        var samecpfsandname = allalunos.filter(elem => pAND(sameId(elem,id),sameUsername(elem,user)));
        await assertTamanhoEqual(samecpfsandname,1);  
    });

})