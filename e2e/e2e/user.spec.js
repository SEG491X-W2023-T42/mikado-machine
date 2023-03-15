require('expect-puppeteer');
const { defineFeature, DefineStepFunction, loadFeature } = require('jest-cucumber');

async function isSectionVisible(section) {
    const wrapper = await page.$(`form > section:nth-child(${section + 1})`);
    if (!wrapper) {
        throw new TypeError;
    }
    const bounding = await wrapper.boundingBox();
    return !!(bounding?.height && bounding.width);
}

function stepClick(when) {
    when(/I click to go to section (\d+)/, async (section) => {
        await page.click(`label[for="view-${parseInt(section, 10) + 1}"]`);
        await page.waitForTimeout(1000); // Debug/Demo
    });
}

function stepSee(then) {
    then(/I see section (\d+)/, async (section) => {
        expect(await isSectionVisible(parseInt(section, 10))).toBeTruthy();
    });
}

function stepNotSee(then) {
    then(/I do not see section (\d+)/, async (section) => {
        expect(await isSectionVisible(parseInt(section, 10))).toBeFalsy();
    });
}

const feature = loadFeature('e2e/user.feature');

defineFeature(feature, testFeature => {
    testFeature('Go through the survey', ({ given, when, then }) => {
        given('I visit the page', async () => {
            await page.goto('https://danielzgtg.github.io/seg3125survey/');
        });

        then('I see the footer', async () => {
            const text = await page.evaluate(() => document.body.innerText);
            expect(text).toContain('Website designed by Daniel Tang (0300068985)');
        });

        for (let i = 1; i < 6; i++) {
            stepNotSee(then);
        }

        for (let i = 0; i < 6; i++) {
            stepNotSee(then);
            stepClick(when);
            stepSee(then);
        }

        for (let i = 0; i < 6; i++) {
            stepNotSee(then);
        }
    });
});

