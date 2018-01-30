class ResetPasswordController {
  constructor($q, ENV, $routeParams, messageService,
    workingModalService, authenticationService, $location) {
    this.$q = $q;
    this.ENV = ENV;
    this.$routeParams = $routeParams;
    this.messageService = messageService;
    this.workingModalService = workingModalService;
    this.authenticationService = authenticationService;
    this.$location = $location;
  }

  $onInit() {
    this.showPassword = false;
    this.showResetForm = false;

    if (this.authenticationService.isAuthenticated()) {
      this.authenticationService.sendAuthenticatedUserToPreviousPath();
      return;
    }

    this.email = this.$routeParams.email;
    this.resetToken = this.$routeParams.token;

    if ((this.email === null) || (this.resetToken === null)) {
      this.messageService.showError('Invalid token or email');
      this.showResetForm = false;
      return;
    }

    const verifyModel = {
      _email: this.email,
      _verificationToken: this.resetToken,
    };

    const verifyResult = this.authenticationService.verifyResetToken(verifyModel);

    const verificationSuccess = () => {
      this.showResetForm = true;
    };

    const verificationFailure = () => {
      this.showResetForm = false;
    };

    verifyResult.promise.then(verificationSuccess, verificationFailure);
  }

  passwordInputType() {
    return this.showPassword
      ? 'text'
      : 'password';
  }

  submitClicked() {
    if (this.form.$valid) {
      this.resetPassword();
    }
  }

  resetFormIsInvalid() {
    return this.resetInProgress || !this.form.$valid;
  }

  resetPassword() {
    this.workingModalService.openModal();

    const resetModel = {
      _email: this.email,
      _password: this.form.password.$viewValue,
      _verificationToken: this.resetToken,
      _confirmPassword: this.form.confirmedPassword.$viewValue,
    };

    this.resetInProgress = true;

    const resetResult = this.authenticationService.resetPassword(resetModel);

    this.messageService.closeToasts();

    const resetSuccessHandler = () => {
      this.resetInProgress = false;
      this.workingModalService.closeModal();

      this.form.$setPristine();

      this.$location.path('/login');

      this.messageService.showInfo('Your password has been set - you may log in now');
    };

    const resetFailureHandler = response => {
      let resetError;
      this.resetInProgress = false;
      this.workingModalService.closeModal();

      if (angular.isDefined(response) && angular.isDefined(response.data) && response.data.status === 400) {
        resetError = angular.isDefined(response.data.data) &&
          angular.isDefined(response.data.data.errors)
          ? response.data.data.errors.join('\n')
          : 'Unknown 400 error';
      } else {
        resetError = `Whoops! We hit a snag - looks like it's on our end (${response.data.status})`;
      }

      this.messageService.showError(`${resetError}`, 'Unable to Reset Password');
    };

    resetResult.promise.then(resetSuccessHandler, resetFailureHandler);
  }
}

ResetPasswordController.$inject = [
  '$q',
  'ENV',
  '$routeParams',
  'messageService',
  'workingModalService',
  'authenticationService',
  '$location',
];

angular.module('phpdraft.authentication').component('resetPassword', {
  controller: ResetPasswordController,
  templateUrl: 'app/features/authentication/resetPassword.component.html',
});