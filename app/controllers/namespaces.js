import Controller from '@ember/controller';

export default Controller.extend({
    ajax: Ember.inject.service(),
    actions: {
        showInfo(name) {
            var alerts = []
            var deploymentData;
            this.get('ajax').request("http://127.0.0.1:8080" + this.get('model.namespace.metadata.selfLink') + name).then(res => {
                this.set('infoShown', true);
                this.set('infoInfos', res);
                deploymentData = res
            }).then(res => {
                this.get('ajax').request("http://127.0.0.1:8080/apis/networking.k8s.io/v1/networkpolicies/").then(networkpolicies => {
                    var networkpolicyports = []
                    if (deploymentData.spec.template.spec.containers[0].hasOwnProperty("ports")) {
                        var containerPort = deploymentData.spec.template.spec.containers[0].ports[0].containerPort
                    }
                    else {
                        var containerPort = -9999
                    }
                    networkpolicies.items.forEach(policy => {
                        var networkPolicyLabels = policy.spec.podSelector.matchLabels
                        var deploymentLabels = deploymentData.metadata.labels
                        var policyPort = policy.spec.ingress[0].ports[0].port
                        for (var deploymentLabel in deploymentLabels) {
                            for (var policyLabel in networkPolicyLabels) {
                                if (deploymentLabels[deploymentLabel] === networkPolicyLabels[policyLabel]) {
                                    console.log(networkPolicyLabels[policyLabel])
                                    policy.spec.ingress[0].ports.forEach(port => {
                                        networkpolicyports.push(port.port)
                                    })
                                    if (containerPort != policyPort) {
                                        alerts.push({
                                            "message": "NetworkPolicy resource " + policy.metadata.name + " applies to this deployment, but " + policy.spec.ingress[0].ports[0].protocol + ":" + policyPort + " is not exposed from the container",
                                            "type": "warning"
                                        })
                                    }
                                }
                            }
                        }
                    })
                    if (!networkpolicyports.includes(containerPort) && networkpolicyports.length > 0) {
                        alerts.push({
                            "message": "This deployment exposes " + containerPort + ", but no matching NetworkPolicy resources allow ingress to this port",
                            "type": "warning"
                        })
                    }
                    this.set('alerts', alerts)
                });
            });
        }
    }


});
