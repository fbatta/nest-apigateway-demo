import { Construct } from "constructs";
import { GcsBackend, TerraformStack } from "cdktf";

import { DockerProvider } from "@cdktf/provider-docker/lib/provider";
import { GoogleBetaProvider } from "@cdktf/provider-google-beta/lib/provider";

import { Image } from "@cdktf/provider-docker/lib/image";
import { RegistryImage } from "@cdktf/provider-docker/lib/registry-image";
import { GoogleCloudRunV2Service } from "@cdktf/provider-google-beta/lib/google-cloud-run-v2-service";

import * as meta from "./app/package.json";

export class NestStack extends TerraformStack {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        new GcsBackend(this, {
            bucket: process.env.BUCKET_NAME!!,
            prefix: "terraform/state"
        });

        new DockerProvider(this, "docker", {
            registryAuth: [{
                address: "gcr.io",
                username: "oauth2accesstoken",
                password: process.env.GCR_ACCESS_TOKEN
            }]
        });

        const gcpProvider = new GoogleBetaProvider(this, 'google-beta-provider', {
            project: process.env.PROJECT_ID,
            region: process.env.REGION
        });

        const nestImage = new Image(this, "nest-build", {
            name: `gcr.io/${gcpProvider.project}/nest:v${meta.version}`,
            buildAttribute: {
                context: `${__dirname}/app`
            },
        });

        const registryImage = new RegistryImage(this, "nest-registry-image", {
            name: nestImage.name
        });

        new GoogleCloudRunV2Service(this, "nest-service", {
            provider: gcpProvider,
            name: "nest-service",
            location: gcpProvider.region || "us-central1",
            template: {
                containers: [{
                    image: registryImage.name,
                    ports: [{ containerPort: 3000 }]
                }],
                maxInstanceRequestConcurrency: 1,
            }
        });
    }
}