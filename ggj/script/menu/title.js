var StateTitle = {
	keydown: function() {
		WizardGame.setState(StateGame);
	},

	render: function() {
		WizardGame.screen.drawImage(WizardGame.images.title, 0, 0, WizardGame.images.title.width * 2, WizardGame.images.title.height * 2);
	}
}