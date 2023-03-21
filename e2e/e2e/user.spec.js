require('expect-puppeteer');
const { defineFeature, DefineStepFunction, loadFeature } = require('jest-cucumber');

async function isVisible(element) {
    const bounding = await element.boundingBox();
    return !!(bounding?.height && bounding.width);
}

let dialog = void 0;
function makeDoClick(selector, isDialog) {
    return async function doClick() {
        const target = isDialog ? dialog : page;
        await target.click(selector);
        await target.waitForTimeout(1000); // Debug/Demo
    };
}

const feature = loadFeature('e2e/user.feature');

defineFeature(feature, testFeature => {
    testFeature('Log in with the emulator', ({ given, when, then }) => {
        given('I open the homepage', async () => {
            await page.goto('http://localhost:3000');
        });

        then('I see the welcome', async () => {
            const text = await page.evaluate(() => document.body.innerText);
            expect(text).toContain('The Mikado Machine is');
        });

        then('I see the SIGN IN WITH GOOGLE button', async () => {
            const button = await page.$('button.google-sign-in-button');
            const text = await page.evaluate(x => x.innerText.toUpperCase(), button);
            // expect(await isVisible(button)).toBeTruthy();
            expect(text).toContain('SIGN IN WITH GOOGLE');
            const icon = await button.$(`svg`);
            const testId = await page.evaluate(x => x.dataset.testid, icon);
            expect(testId).toBe("GoogleIcon")
        });

        const target$ = new Promise(resolve => browser.once('targetcreated', resolve));
        when('I click to sign in with Google', makeDoClick('button.google-sign-in-button', false));

        then('I see the auth emulator prompt', async () => {
            dialog = await (await target$).page();

            // For some reason, the sign in pop up is glitched while in puppeteer unless this is done
            await dialog.setViewport({
                width: 500,
                height: 600,
            });
            await dialog.reload();
            await dialog.waitForSelector('#title');

            const text = await dialog.evaluate(() => document.body.innerText);
            expect(text).toContain('Sign-in with');
        });

        when('I click to add a new account', makeDoClick('#add-account-button > button', true));

        then('I see an email and name form', async () => {
            const email = await dialog.waitForSelector('form#main-form input#email-input');
            const name = await dialog.waitForSelector('form#main-form input#display-name-input');
            expect(await isVisible(email)).toBeTruthy();
            expect(await isVisible(name)).toBeTruthy();
        });

        when('I click to auto-generate the information', makeDoClick('button#autogen-button', true));

        then('I see that the emulator email is not blank', async () => {
            const email = await dialog.waitForSelector('form#main-form input#email-input');
            const text = await dialog.evaluate(x => x.value, email);
            expect(text).not.toBe('');
        });

        when('I click to sign in with the new emulator account', makeDoClick('button#sign-in', true));

        then('I see a graph with edges', async () => {
            const edges = await page.waitForSelector('svg.react-flow__edges');
            expect(await isVisible(edges)).toBeTruthy();
            await page.waitForTimeout(1000); // Debug/Demo
        });

        for (let i = 0; i < 3; i++) {
            then(/I see the text (\w+) somewhere in the graph/, async (expected) => {
                const nodes = await page.$('div.react-flow__nodes');
                const actual = await page.evaluate(x => x.innerText, nodes);
                expect(actual).toContain(expected);
            });
        }
    });
});

