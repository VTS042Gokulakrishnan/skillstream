const base=require('../public-site/jest.config.cjs');
module.exports={...base,testMatch:['<rootDir>/client/src/Components/EmployerUI/EmployerUI.test.js'],cacheDirectory:'<rootDir>/.ui-test-cache/employer/jest-cache'};
