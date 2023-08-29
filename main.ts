import { App } from "cdktf";
import { ApiGatewayStack } from "./ApiGatewayStack";
import { NestStack } from "./NestStack";

const app = new App();
new ApiGatewayStack(app, "nest-apigateway-demo-gateway");
new NestStack(app, "nest-apigateway-demo-backend");
app.synth();
