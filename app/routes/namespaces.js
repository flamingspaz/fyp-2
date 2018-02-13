import Route from '@ember/routing/route';

export default Route.extend({

//model() {
/*
    fetch('http://127.0.0.1:8080/api/v1/namespaces/kube-system/pods/')
  .then(response => {
    if (response.ok) {
      //return Promise.resolve(response);
    }
    else {
      //return Promise.reject(new Error('Failed to load'));
    }
  })
  .then(response => response.json()) // parse response as JSON
  .then(data => {
    return data;
  })
  .catch(function(error) {
    console.log(`Error: ${error.message}`);
  });
*/

ajax: Ember.inject.service(),
model(params) {

    return Ember.RSVP.hash({
        "deployments": this.get('ajax').request("http://127.0.0.1:8080/apis/apps/v1/namespaces/" + params.namespace_id + "/deployments/"),
        "namespaces": this.get('ajax').request("http://127.0.0.1:8080/api/v1/namespaces")
    });

}

});
