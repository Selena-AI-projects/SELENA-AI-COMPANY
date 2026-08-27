import type { MeasurementScenario } from "./index";
import { avlibaliScenario } from "./avlibali";
import { bigdragonvillasScenario } from "./bigdragonvillas";
import { chitobistroScenario } from "./chitobistro";
import { cubebaliScenario } from "./cubebali";
import { eskqbarScenario } from "./eskqbar";
import { korafoodhallScenario } from "./korafoodhall";
import { otherbaliScenario } from "./otherbali";
import { petidScenario } from "./petid";
import { remhaosScenario } from "./remhaos";
import { selenasystemsScenario } from "./selenasystems";
import { villaopsScenario } from "./villaops";

/**
 * Projects that have a confirmed question set. A project is added here only
 * once there is a real basis for its questions — measuring the wrong list
 * costs little and misleads a lot.
 */
export const scenarios: Record<string, MeasurementScenario> = {
  avlibali: avlibaliScenario,
  bigdragonvillas: bigdragonvillasScenario,
  chitobistro: chitobistroScenario,
  cubebali: cubebaliScenario,
  eskqbar: eskqbarScenario,
  korafoodhall: korafoodhallScenario,
  otherbali: otherbaliScenario,
  petid: petidScenario,
  remhaos: remhaosScenario,
  selenasystems: selenasystemsScenario,
  villaops: villaopsScenario,
};

export const scenarioSlugs = Object.keys(scenarios);
