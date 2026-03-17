process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { podConfig, serviceConfig, ingressConfig } from "../utils/config";
import yaml from "yaml";
import K8Service from "../service/k8s.service";

const serviceInstance = new K8Service({
  localCluster: true,
});

async function main() {
  try {
    let podConf = podConfig
      .replace("_podname_", "testing-pod")
      .replace("_podlabel_", "testing");

    const podManifest = yaml.parse(podConf);
    const pod = await serviceInstance.addNewPod("default", podManifest);
    console.log(pod.metadata?.name, pod.metadata?.name);

    let serviceConf = serviceConfig
      .replace("_podname_", "testing-pod")
      .replace("_podlabel_", "testing");

    const serviceManifest = yaml.parse(serviceConf);
    const service = await serviceInstance.addNewService(
      "default",
      serviceManifest,
    );
    console.log(service.metadata?.name, service.metadata?.namespace);

    let ingressConf = ingressConfig.replaceAll("_podname_", "testing-pod");
    ingressConf = ingressConf.replaceAll("_slug_", "testing");
    const ingressManifest = yaml.parse(ingressConf);

    const ingress = await serviceInstance.addNewIngress(
      "default",
      ingressManifest,
    );
    console.log(ingress.metadata?.name, ingress.metadata?.namespace);

    console.log(JSON.stringify(ingressManifest, null, 2));
    await Promise.resolve(() => {
      setTimeout(() => {}, 3000);
    });

    // await serviceInstance.removePod(
    //   pod.metadata?.namespace!,
    //   pod.metadata?.name!,
    // );

    // console.log("pod removed");

    // await serviceInstance.removeService(
    //   service.metadata?.namespace!,
    //   service.metadata?.name!,
    // );

    // console.log("service removed");

    // await serviceInstance.removeIngress(
    //   ingress.metadata?.namespace!,
    //   ingress.metadata?.name!,
    // );

    // console.log("ingress removed");
  } catch (err) {
    console.error("Kubernetes operation failed:", err);
  }
}

main();
