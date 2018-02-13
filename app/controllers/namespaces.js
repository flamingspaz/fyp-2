import Controller from '@ember/controller';

export default Controller.extend({
    ajax: Ember.inject.service(),
    actions: {
        showInfo(name) {
             this.get('ajax').request("http://127.0.0.1:8080" + this.get('model.metadata.selfLink') + name).then(res => {
                 this.set('infoShown', true);
                 this.set('infoInfos', res);
             });
        }
    }


});
