import type { MeasurementScenario } from "./index";
import { bigdragonvillasScenario } from "./bigdragonvillas";
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
  bigdragonvillas: bigdragonvillasScenario,
  korafoodhall: korafoodhallScenario,
  otherbali: otherbaliScenario,
  petid: petidScenario,
  remhaos: remhaosScenario,
  selenasystems: selenasystemsScenario,
  villaops: villaopsScenario,
};

export const scenarioSlugs = Object.keys(scenarios);
