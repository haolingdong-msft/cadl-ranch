import {
  $serviceTitle,
  $serviceVersion,
  createDecoratorDefinition,
  DecoratorContext,
  InterfaceType,
  NamespaceType,
  OperationType,
  Program,
} from "@cadl-lang/compiler";
import { $route, $server } from "@cadl-lang/rest/http";
import { reportDiagnostic } from "./lib.js";
import { SupportedBy } from "./types.js";

const SupportedByOptions: Set<string> = new Set(["arm", "dpg"]);
const SupportedBy = Symbol("SupportedBy");
const decoratorSignature = createDecoratorDefinition({
  name: "@scenario",
  target: "Namespace",
  args: [{ kind: "String" }],
} as const);
export function $supportedBy(context: DecoratorContext, target: NamespaceType, catgory: string) {
  if (!decoratorSignature.validate(context, target, [catgory])) {
    return;
  }

  if (!SupportedByOptions.has(catgory)) {
    reportDiagnostic(context.program, {
      code: "category-invalid",
      format: { catgory, allowed: [...SupportedByOptions].join(", ") },
      target: context.getArgumentTarget(0)!,
    });
  }
  context.program.stateMap(SupportedBy).set(target, catgory);
}

export function getSupportedBy(program: Program, target: NamespaceType): SupportedBy | undefined {
  return program.stateMap(SupportedBy).get(target);
}

const ScenarioDocKey = Symbol("ScenarioDoc");
const scenarioDocSignature = createDecoratorDefinition({
  name: "@scenario",
  target: "Operation",
  args: [{ kind: "String" }],
} as const);
export function $scenarioDoc(context: DecoratorContext, target: OperationType, doc: string) {
  if (!scenarioDocSignature.validate(context, target, [doc])) {
    return;
  }
  context.program.stateMap(ScenarioDocKey).set(target, doc);
}

export function getScenarioDoc(program: Program, target: OperationType): string | undefined {
  return program.stateMap(ScenarioDocKey).get(target);
}

const ScenarioKey = Symbol("Scenario");
const scenarioSignature = createDecoratorDefinition({
  name: "@scenario",
  target: ["Operation", "Namespace", "Interface"],
  args: [{ kind: "String", optional: true }],
} as const);
export function $scenario(
  context: DecoratorContext,
  target: NamespaceType | OperationType | InterfaceType,
  name?: string,
) {
  if (!scenarioSignature.validate(context, target, [name])) {
    return;
  }
  context.program.stateMap(ScenarioKey).set(target, name ?? target.name);
}

export interface Scenario {
  name: string;
  target: OperationType | InterfaceType | NamespaceType;
}

export function listScenarios(program: Program): Scenario[] {
  return [...(program.stateMap(ScenarioKey).entries() as any)].map(([target, name]) => {
    return {
      target,
      name: resolveScenarioName(target, name),
    };
  });
}

function resolveScenarioName(target: OperationType | InterfaceType | NamespaceType, name: string) {
  if (target.kind === "Operation" && target.interface) {
    name = `${target.interface.name}_${name}`;
  }
  return target.namespace ? `${target.namespace.name}_${name}` : name;
}

export function getScenarioName(
  program: Program,
  target: OperationType | InterfaceType | NamespaceType,
): string | undefined {
  const name = program.stateMap(ScenarioKey).get(target);
  return resolveScenarioName(target, name);
}

const ScenarioServiceKey = Symbol("ScenarioService");
const scenarioServiceSignature = createDecoratorDefinition({
  name: "@scenarioService",
  target: "Namespace",
  args: [{ kind: "String" }],
} as const);
export function $scenarioService(context: DecoratorContext, target: NamespaceType, route: string) {
  if (!scenarioServiceSignature.validate(context, target, [route])) {
    return;
  }
  context.program.stateSet(ScenarioServiceKey).add(target);
  context.call($serviceTitle, target, context.program.checker.getNamespaceString(target));
  context.call($serviceVersion, target, "1.0.0");
  context.call($server, target, "http://localhost:3000", "TestServer endpoint");
  context.call($route, target, route);
}
