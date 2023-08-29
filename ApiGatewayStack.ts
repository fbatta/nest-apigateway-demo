import { readFileSync } from "fs";
import { Construct } from "constructs";
import { GcsBackend, TerraformStack } from "cdktf";

import { GoogleBetaProvider } from "@cdktf/provider-google-beta/lib/provider";

import { GoogleApiGatewayApi } from "@cdktf/provider-google-beta/lib/google-api-gateway-api";
import { GoogleApiGatewayApiConfigA } from "@cdktf/provider-google-beta/lib/google-api-gateway-api-config";
import { GoogleApiGatewayGateway } from "@cdktf/provider-google-beta/lib/google-api-gateway-gateway";

export class ApiGatewayStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new GcsBackend(this, {
      bucket: process.env.BUCKET_NAME!!,
      prefix: "terraform/state/apigateway"
    });

    const googleBetaProvider = new GoogleBetaProvider(this, 'google-beta-provider', {
      project: process.env.PROJECT_ID,
      region: process.env.REGION
    });

    const nestApi = new GoogleApiGatewayApi(this, 'api-gateway-api', {
      provider: googleBetaProvider,
      apiId: 'nest-api'
    });

    const nestApiConfig = new GoogleApiGatewayApiConfigA(this, 'api-gateway-config', {
      provider: googleBetaProvider,
      api: nestApi.apiId,
      apiConfigId: 'nest-api-config-v1',
      openapiDocuments: [{
        document: {
          path: 'spec.yaml',
          contents: readFileSync(`${__dirname}/openapi.yaml`, { encoding: 'base64' }),
        }
      }],
      lifecycle: {
        createBeforeDestroy: true
      }
    });

    new GoogleApiGatewayGateway(this, 'api-gateway-gateway', {
      provider: googleBetaProvider,
      apiConfig: nestApiConfig.id,
      gatewayId: 'nest-gateway'
    });
  }
}