import Component from '@ember/component';

export default Component.extend({
    didRender() {
        console.log(this.get('data'));
    }
});
