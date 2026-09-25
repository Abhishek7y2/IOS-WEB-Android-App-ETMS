describe('02 - Registration Flow & Validations', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('/register');
  });

  const completePrerequisites = (mobile = '9876543299') => {
    cy.intercept('POST', '**/api/auth/request-registration-otp', {
      statusCode: 200,
      body: { success: true, message: 'Verification code sent.' },
    }).as('reqPhoneOtp');

    cy.intercept('POST', '**/api/auth/verify-registration-otp', {
      statusCode: 200,
      body: { success: true, message: 'Mobile number verified successfully.' },
    }).as('verifyPhoneOtp');

    cy.get('#firstName').clear().type('John');
    cy.get('#lastName').clear().type('Doe');
    cy.get('input[name="gender"][value="Male"]').click({ force: true });
    cy.contains('Select Qualification').click();
    cy.contains("Bachelor's").click();
    cy.get('#mobile').clear().type(mobile);

    // Verify phone OTP to enable subsequent fields
    cy.contains('button', 'Verify Phone Number').click();
    cy.wait('@reqPhoneOtp');
    cy.get('input[placeholder="••••••"]').type('123456');
    cy.contains('button', 'Verify').click();
    cy.wait('@verifyPhoneOtp');
    cy.contains('Verified').should('be.visible');
  };

  it('E2E-REG-001: Missing fields triggers validation errors', () => {
    // Initial state: form is empty, submit button is disabled
    cy.get('button[type="submit"]').should('be.disabled');

    // Type incomplete mobile number
    cy.get('#mobile').type('9876');
    cy.contains('Please enter the valid Phone number').should('be.visible');

    // Verify firstName auto-filters numbers
    cy.get('#firstName').type('John123');
    cy.get('#firstName').should('have.value', 'John');

    // Button remains disabled
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('E2E-REG-002: Invalid email format triggers validation error', () => {
    completePrerequisites('9876543291');

    // Email is now enabled
    cy.get('#email').should('not.be.disabled').type('invalid-email-format').blur();
    cy.contains(/valid email/i).should('be.visible');
  });

  it('E2E-REG-003: Weak password fails password validation', () => {
    completePrerequisites('9876543292');

    // Password is now enabled
    cy.get('#password').should('not.be.disabled').type('123');
    cy.contains('Password Format Guidance').should('be.visible');
    cy.contains('8 to 64 Characters').parent().should('contain.text', '•');
  });

  it('E2E-REG-004: Duplicate email triggers controlled backend conflict error', () => {
    completePrerequisites('9876543293');

    cy.intercept('POST', '**/api/auth/request-registration-email-otp', {
      statusCode: 200,
      body: { success: true, message: 'Email OTP sent.' },
    }).as('reqEmailOtp');

    cy.intercept('POST', '**/api/auth/verify-registration-email-otp', {
      statusCode: 200,
      body: { success: true, message: 'Email verified successfully.' },
    }).as('verifyEmailOtp');

    cy.get('#email').type('admin@enterprise.test');
    cy.contains('button', 'Verify Email Address').click();
    cy.wait('@reqEmailOtp');
    cy.get('input[placeholder="••••••"]').last().type('123456');
    cy.contains('button', 'Verify').click();
    cy.wait('@verifyEmailOtp');

    cy.get('#password').type('StrongPass@123');
    cy.get('#confirmPassword').type('StrongPass@123');

    cy.get('button[type="submit"]').click();

    // Verify error notification or inline error indicates duplicate user/email exists
    cy.contains(/already exists|duplicate|registered|conflict|try logging in/i, { timeout: 10000 }).should('be.visible');
  });

  it('E2E-REG-005: Valid registration with test OTP fixture exercises complete UI -> API -> State', () => {
    completePrerequisites('9876543294');

    cy.intercept('POST', '**/api/auth/request-registration-email-otp', {
      statusCode: 200,
      body: { success: true, message: 'Email OTP sent.' },
    }).as('reqEmailOtp5');

    cy.intercept('POST', '**/api/auth/verify-registration-email-otp', {
      statusCode: 200,
      body: { success: true, message: 'Email verified successfully.' },
    }).as('verifyEmailOtp5');

    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 201,
      body: {
        success: true,
        message: 'Registration initiated. Verification OTP sent.',
        email: 'newuser.e2e@enterprise.test',
        requiresVerification: true,
      },
    }).as('registerReq');

    cy.get('#email').type('newuser.e2e@enterprise.test');
    cy.contains('button', 'Verify Email Address').click();
    cy.wait('@reqEmailOtp5');
    cy.get('input[placeholder="••••••"]').last().type('123456');
    cy.contains('button', 'Verify').click();
    cy.wait('@verifyEmailOtp5');

    cy.get('#password').type('ValidStrong@123');
    cy.get('#confirmPassword').type('ValidStrong@123');

    cy.get('button[type="submit"]').should('not.be.disabled').click();
    cy.wait('@registerReq');

    cy.get('body').then(($body) => {
      expect($body.text()).to.match(/verification|otp|code|success|account|initiated/i);
    });
  });
});
