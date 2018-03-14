import Route from '@ember/routing/route';
import { hash } from 'rsvp';
export default Route.extend({

ajax: Ember.inject.service(),
model(params) {
    return hash({
      namespace: this.get('ajax').request("http://127.0.0.1:8080/apis/apps/v1/namespaces/" + params.namespace_id + "/deployments/"),
      networkpolicies: this.get('ajax').request("http://127.0.0.1:8080/apis/networking.k8s.io/v1/networkpolicies/")
    });
}

});
