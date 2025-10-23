exports.PolicyIssuancePage = class PolicyIssuancePage {

    constructor(page) {

        this.page = page;
 
        // Selectors for the Policy Details section
        this.policyTypeNew = "//button[normalize-space()='New']";
        this.policyTypeRenew = "//button[normalize-space()='Renew']";
        this.vehicleClassPrivate = "//button[normalize-space()='Private']";
        this.vehicleClassCommercial = "//button[normalize-space()='Commercial']";
        this.individualButton = "//button[normalize-space()='Individual']";
        this.corporateButton = "//button[normalize-space()='Corporate']";
        this.vehicleCoverDropdown = 'div[role="combobox"]#mui-component-select-CoverTypeId';
        this.vehicleCoverOption = "div[id='menu-CoverTypeId'] li:nth-child(2)"; 
        this.vehicleCoverDropdownOption = "div[id='menu-CoverTypeId'] li:nth-child(2)";
        // Selectors for Customer Details
        this.salutationDropdown = '#mui-component-select-SALUTATION';
        this.salutationDropdownOption = "//li[normalize-space()='MR.']"
        this.salutationDropdownCorporate = "//div[@id='mui-component-select-COMPANY_SALUTATION']";
        this.salutationDropdownCorporateOption = "li:nth-child(4)";
        this.firstNameInput = '[name="FIRST_NAME"]';
        this.middleNameInput = '[name="MIDDLE_NAME"]';
        this.lastNameInput = '[name="LAST_NAME"]';
        this.emailInput = '//input[@name="EMAIL"]';
        this.mobileNoInput = '[name="MOB_NO"]';
        this.alternateMobileNoInput = '[name="ALT_MOBILE_NO"]';
        this.companyNametext = '//input[@name="COMPANY_NAME"]';
 
        // Selectors for Vehicle Details
        this.chassisNoInput = '[name="ChassisNo"]';
        this.engineNoInput = '[name="EngineNo"]';

        this.oemDropdown = '#mui-component-select-FKOEM_ID';
        this.oemDropdownOption = "//li[normalize-space()='PVBU']";

        this.makeDropdown = "//div[@id='mui-component-select-MakeId']";
        this.makeDropdownOption ="//li[normalize-space()='Tata Motors']";
        
        this.modelDropdown = "//div[@id='mui-component-select-ModelId']";
        this.modelDropdownOption = "//li[normalize-space()='ALTROZ']";

        this.variantDropdown = "//div[@id='mui-component-select-VariantId']";
        this.variantDropdownOption ="//li[normalize-space()='ALTROZ XE+ 1.5 D']";

        this.yearOfManufactureDropdown = "//div[@id='mui-component-select-DateofManufacture']";
        this.yearOfManufactureDropdownOption = "//li[normalize-space()='2024']";

        this.registrationDropdown = "div[id='mui-component-select-RTOId'] span[class='text-sm']";
        this.registrationDropdownOption = "li:nth-child(7)";

        this.customerResidenceStateDropdown = "div[id='mui-component-select-IsuredStateId'] span[class='text-sm']" ;
        this.customerResidenceStateDropdownOption= "li:nth-child(8)";

        this.registrationDateCalendar = '//input[@value="DD/MM/YYYY"]';
        // change date to current date in locator 
        this.registrationDateCalendarCurrentdate = "//button[normalize-space()='25']";

        this.yesRadioButton = "//div[@class='MuiGrid2-root MuiGrid2-direction-xs-row MuiGrid2-grid-xs-12 MuiGrid2-grid-md-4 css-grry9j']//button[@value='true'][normalize-space()='Yes']";
        this.noRadioButton = "//div[@class='MuiGrid2-root MuiGrid2-direction-xs-row MuiGrid2-grid-xs-12 MuiGrid2-grid-md-4 css-grry9j']//button[@value='false'][normalize-space()='No']";
 
        // Selectors for BH Registration
        this.bhYesButton = "//button[@value='1']";
        this.bhNoButton = "//button[@value='3']";
        this.bhSpecialRegNoButton = "//button[normalize-space()='Special Reg No.']";
        this.bhYesTextbox1 = '//input[@name="BHNumberSeries3"]';
        this.bhYesTextbox2 = '//input[@name="BHNumberSeries2"]';
        this.bhNoTextbox3 = '//input[@name="RTO_NAME"]';
        this.bhNoTextbox4 = '//input[@name="RegistrationNo1"]';
        this.bhNoTextbox5 = '//input[@name="RegistrationNo2"]';
        this.specialRegNoTextbox = '//input[@name="SpecialRegistartionNo"]';
 
        // Selectors for Additional Discount
        this.ncbCarryForwardYesButton = "//div[@class='MuiGrid2-root MuiGrid2-container MuiGrid2-direction-xs-row MuiGrid2-spacing-xs-4 css-1xf7owi']//div[1]//div[1]//button[1]";
        this.ncbCarryForwardNoButton = "//div[@class='MuiGrid2-root MuiGrid2-container MuiGrid2-direction-xs-row MuiGrid2-spacing-xs-4 css-1xf7owi']//div[1]//div[1]//button[2]";
        this.ncbPercentageDropdown = "//div[@id='mui-component-select-NCBLevel']";
        this.ncbPercentageDropdownOption = "li:nth-child(4)";
        this.voluntaryExcessYesButton = "//div[@id='root']//div[3]//div[1]//button[1]";
        this.voluntaryExcessNoButton = "//div[@id='root']//div[3]//div[1]//button[2]";
        this.voluntaryExcessDropdown = "#mui-component-select-VoluntaryExcess";
        this.voluntaryExcessDropdownOption = "li:nth-child(3)";
        this.aaiMembershipYesButton = "//div[@class='MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiAccordion-root MuiAccordion-rounded Mui-expanded MuiAccordion-gutters css-1s52yv6']//div[4]//div[1]//button[1]";
        this.aaiMembershipNoButton = "//div[@class='MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiAccordion-root MuiAccordion-rounded Mui-expanded MuiAccordion-gutters css-1s52yv6']//div[4]//div[1]//button[2]";

        this.antiTheftYesButton = "//div[@class='MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiAccordion-root MuiAccordion-rounded Mui-expanded MuiAccordion-gutters css-1s52yv6']//div[5]//div[1]//button[1]";
        this.antiTheftNoButton = "(//button[@value='false'][normalize-space()='No'])[5]";

        // Selector for Optional details
        this.biFuleKitPrice = '//input[@name="BiFuelValue"]';
        this.electricalAccessoriesPrice = '//input[@name="ElectricalValue"]';
        this.nonelectricalAccessoriesPrice = '//input[@name="NonElectricalValue"]';
        this.capTenure = "//div[@id='mui-component-select-CPATenure']";
        this.capTenureOption0 = "//li[normalize-space()='0']";

        this.capTenureOption3 = "//li[normalize-space()='3']";
        this.capWaiverReasonDropDown ="//div[@id='mui-component-select-CPAReason']";
        this.capWaiverReasonDropDownOption ="//li[normalize-space()='Owner Not having valid Driving License']";
        this.capWaiverReasonCommercialDropDownOption = "div[id='menu-CPAReason'] li:nth-child(2)";
        this.capTenureCommecialDropdown = "#mui-component-select-CPATenure";
        this.capTenureCommecialDropdownOption = "div[id='menu-CPATenure'] li:nth-child(1)";
        this.geographicalExtensionDropdown = "//div[@id='mui-component-select-GeoArea']";
        this.geographicalExtensionDropdownOption = "//li[normalize-space()='Nepal']";
        this.paCoverYesButton = "//div[@class='MuiGrid2-root MuiGrid2-direction-xs-row MuiGrid2-grid-xs-12 css-1qiq4rk']//button[@value='true'][normalize-space()='Yes']";
        this.paCoverNoButton = "div[class='MuiGrid2-root MuiGrid2-direction-xs-row MuiGrid2-grid-xs-12 css-1qiq4rk'] button[value='false']";
        this.paCoverAmountDropDown = "//div[@id='mui-component-select-CoverAmount']//span[@class='text-sm'][contains(text(),'--Select PA Cover Amount (₹)--')]";
        this.paCoverAmountDropDownOption = '//li[@data-value="30000"]';
        this.paCoverPaidDriverYesButton = "//div[@id='divpacoverpaiddriver']//button[@value='true'][normalize-space()='Yes']";
        this.paCoverPaidDriverNoButton = "//div[@id='divpacoverpaiddriver']//button[@value='false'][normalize-space()='No']";
        this.leagelLiablityDropdown = "//div[@id='mui-component-select-OtherEmp']";
        this.leagelLiablityDropdownOption = "li:nth-child(3)";


        // Selector for Get Quotes button

        this.getQuotesButton = "//button[normalize-space()='Get Quotes']";
        this.getQuoteButtonCommercial = '//button[@type="submit"]';
        this.icFGButton = "(//button[@type='button'])[5]"; 
        this.icCholaButton = "//div[@class='MuiGrid-root MuiGrid-container MuiGrid-spacing-xs-6 css-1h77wgb']//div[2]//div[1]//div[1]//div[1]//div[1]//div[3]//div[1]//div[2]//button[1]";
        this.icFGbuttonCommercial = "div[class='MuiBox-root css-hpgrbf'] div:nth-child(1) div:nth-child(1) div:nth-child(1) div:nth-child(1) div:nth-child(1) div:nth-child(3) div:nth-child(1) div:nth-child(2) button:nth-child(1)";
        this.icCholaButtonCommercial = "//div[@class='MuiGrid-root MuiGrid-container MuiGrid-spacing-xs-6 css-1h77wgb']//div[2]//div[1]//div[1]//div[1]//div[1]//div[3]//div[1]//div[2]//button[1]";
    }
 
    // Method to click on the IC button

       

    
 
    // Methods for Policy Details section

    async selectPolicyTypeNew() {

        await this.page.click(this.policyTypeNew);

    }
 
    async selectPolicyTypeRenew() {

        await this.page.click(this.policyTypeRenew);

    }
 
    async selectVehicleClassPrivate() {

        await this.page.click(this.vehicleClassPrivate);

    }
 
    async selectVehicleClassCommercial() {

        await this.page.click(this.vehicleClassCommercial);

    }
 
    async selectIndividual() {

        await this.page.click(this.individualButton);

    }
 
    async selectCorporate() {

        await this.page.click(this.corporateButton);

    }
    async selectVehicleCoverOption() {

        await this.page.click(this.vehicleCoverDropdown); // Click to open the dropdown
        await this.page.click(this.vehicleCoverOption); // Click on the desired option
    
    }
    
    async selectVehicleCoverOption1() {

        await this.page.click(this.vehicleCoverDropdown); // Click to open the dropdown
        await this.page.click(this.vehicleCoverDropdownOption); // Click on the desired option
    
    }
    



    async selectSalutationOption() {

        await this.page.click(this.salutationDropdown); // Click to open the dropdown
        await this.page.click(this.salutationDropdownOption); // Click on the desired option
    
    }

    async selectCorporateSalutationOption() {

        await this.page.click(this.salutationDropdownCorporate); // Click to open the dropdown
        await this.page.click(this.salutationDropdownCorporateOption); // Click on the desired option
    
    }
   
 
    // Methods for Customer Details

    async fillCustomerDetails(data) {

        // await this.page.selectOption(this.salutationDropdown, { Value: "MR." });
        await this.page.fill(this.firstNameInput, data.firstName);
        await this.page.fill(this.middleNameInput, data.middleName);
        await this.page.fill(this.lastNameInput, data.lastName);
        await this.page.fill(this.emailInput, data.email);
        await this.page.fill(this.mobileNoInput, data.mobileNo);
        await this.page.fill(this.alternateMobileNoInput, data.alternateMobileNo);

    }

    async fillCompanydetails(data) {

        // await this.page.selectOption(this.salutationDropdown, { Value: "MR." });
        await this.page.fill(this.companyNametext, data.companyName);
        await this.page.fill(this.emailInput, data.email);
        await this.page.fill(this.mobileNoInput, data.mobileNo);
        await this.page.fill(this.alternateMobileNoInput, data.alternateMobileNo);

    }
 
    // Methods for Vehicle Details

    async fillVehicleDetails(data) {
        await this.page.fill(this.chassisNoInput, data.chassisNo);
        await this.page.fill(this.engineNoInput, data.engineNo);


    }
    async selectOemOption() {

        await this.page.click(this.oemDropdown); // Click to open the dropdown
    
        await this.page.click(this.oemDropdownOption); // Click on the desired option
    
    }

    async selectMakeOption() {

        await this.page.click(this.makeDropdown); // Click to open the dropdown
    
        await this.page.click(this.makeDropdownOption); // Click on the desired option
    
    }

    async selectModelOption() {

        await this.page.click(this.modelDropdown); // Click to open the dropdown
    
        await this.page.click(this.modelDropdownOption); // Click on the desired option
    
    }

    async selectVariantOption() {

        await this.page.click(this.variantDropdown); // Click to open the dropdown
    
        await this.page.click(this.variantDropdownOption); // Click on the desired option
    
    }

    async selectManufactureYearOption() {

        await this.page.click(this.yearOfManufactureDropdown); // Click to open the dropdown
    
        await this.page.click(this.yearOfManufactureDropdownOption); // Click on the desired option
    
    }

    async selectRegistrationCity() {

        await this.page.click(this.registrationDropdown); // Click to open the dropdown
    
        await this.page.click(this.registrationDropdownOption); // Click on the desired option
    
    }

   

    async selectCustomerResidenceStateOption() {

        await this.page.click(this.customerResidenceStateDropdown); // Click to open the dropdown
    
        await this.page.click(this.customerResidenceStateDropdownOption); // Click on the desired option
    
    }
      
    async selectDateOption() {
        await this.page.click(this.registrationDateCalendar);
        await this.page.click(this.registrationDateCalendarCurrentdate); // Adjust selector for picking today's date

    }
 
    // Methods for BH Registration

    async selectBHRegistration(option, data) {

        if (option === 'YES') {

            await this.page.click(this.bhYesButton);
            await this.page.fill(this.bhYesTextbox1, data.text1);
            await this.page.fill(this.bhYesTextbox2, data.text2);

        } else if (option === 'NO') {
            await this.page.click(this.bhNoButton);
            await this.page.fill(this.bhNoTextbox3, data.text3);
            await this.page.fill(this.bhNoTextbox4, data.text4);
            await this.page.fill(this.bhNoTextbox5, data.text5);

        } else if (option === 'SPECIAL REG NO') {
            await this.page.click(this.bhSpecialRegNoButton);
            await this.page.fill(this.specialRegNoTextbox, data.text6);

        }

    }
 
    // Methods for Additional Discount

    async setNCBCarryForward(option) {

        if (option === 'YES') {
            await this.page.click(this.ncbCarryForwardYesButton);
            await this.page.click(this.ncbPercentageDropdown);
            await this.page.click(this.ncbPercentageDropdownOption);


        } else {

            await this.page.click(this.ncbCarryForwardNoButton);

        }

    }
 
    async setVoluntaryExcess(option) {

        if (option === 'YES') {
            await this.page.click(this.voluntaryExcessYesButton);
            await this.page.click(this.voluntaryExcessDropdown);
            await this.page.click(this.voluntaryExcessDropdownOption);


        } else {
            await this.page.click(this.voluntaryExcessNoButton);

        }

    }
 
    async setAAIMembership(option) {

        if (option === 'YES') {
            await this.page.click(this.aaiMembershipYesButton);
        } else {
            await this.page.click(this.aaiMembershipNoButton);

        }

    }
    async setAntiTheft(option) {
        if (option === 'YES') {
            await this.page.click(this.antiTheftYesButton);

        } else {
            await this.page.click(this.antiTheftNoButton);

        }

    }


    // Method Optional details


    async fillBifuelKit(data) {
        await this.page.fill(this.biFuleKitPrice, data.bifuelkitprice);
        await this.page.fill(this.electricalAccessoriesPrice, data.electricalPrice);
        await this.page.fill(this.nonelectricalAccessoriesPrice, data.nonelectricalPrice);



    }

    async setCAPTenure() {
        await this.page.click(this.capTenure);
        await this.page.click(this.capTenureOption3);

    }

    async setCAPTenureCommercial() {
        await this.page.click(this.capTenureCommecialDropdown);
        await this.page.click(this.capTenureCommecialDropdownOption);

    }

    async setCAPWaiverReasonCommercial() {
        await this.page.click(this.capWaiverReasonDropDown);
        await this.page.click(this.capWaiverReasonCommercialDropDownOption);

    }


    async setCAPWaiverReason() {
        await this.page.click(this.capWaiverReasonDropDown);
        await this.page.click(this.capWaiverReasonDropDownOption);

    }

    async setGeographicalExtension() {
        await this.page.click(this.geographicalExtensionDropdown);
        await this.page.click(this.geographicalExtensionDropdownOption);

    }

    async setPACoverUnname(option) {

        if (option === 'YES') {
            await this.page.click(this.paCoverYesButton);
            await this.page.click(this.paCoverAmountDropDown);
            await this.page.click(this.paCoverAmountDropDownOption);
        } else {
            await this.page.click(this.paCoverNoButton);

        }

    }

    async setPACoverPaidDriver(option) {

        if (option === 'YES') {
            await this.page.click(this.paCoverPaidDriverYesButton);
            
        } else {
            await this.page.click(this.paCoverPaidDriverNoButton);

        }

    }
    
   
    async setLegalLibillity(){

        await this.page.click(this.leagelLiablityDropdown);
        await this.page.click(this.leagelLiablityDropdownOption);
    }


    // Method to click Get Quotes

    async clickGetQuotes() {
        await this.page.click(this.getQuotesButton);

    }


    async clickGetQuotesCommercial() {
        await this.page.click(this.getQuoteButtonCommercial);

    }


    async clickFGICButton() {
        await this.page.click(this.icFGButton);

    }

    async clickCholaICButton() {
        await this.page.click(this.icCholaButton);

    }


    async clickCholaICButtonCommercial() {
        await this.page.click(this.icCholaButtonCommercial);

    }

    async clickFGICButtonCommercial() {
        await this.page.click(this.icFGbuttonCommercial);

    }

}
 

 