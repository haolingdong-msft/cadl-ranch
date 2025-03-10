import { CadlRanchCoverageClient, CoverageReport, GeneratorMetadata } from "@azure-tools/cadl-ranch-coverage-sdk";
import { logger } from "../logger.js";
import pc from "picocolors";
import { readFile } from "fs/promises";
import { AzureCliCredential } from "@azure/identity";

export interface UploadCoverageReportConfig {
  coverageFile: string;
  storageAccountName: string;
  generatorName: string;
  generatorVersion: string;
  generatorCommit?: string;
}

export async function uploadCoverageReport({
  coverageFile,
  storageAccountName,
  generatorName,
  generatorVersion,
  generatorCommit: geenratorCommit,
}: UploadCoverageReportConfig) {
  const content = await readFile(coverageFile);
  const coverage: CoverageReport = JSON.parse(content.toString());

  const client = new CadlRanchCoverageClient(storageAccountName, new AzureCliCredential());
  const generatorMetadata: GeneratorMetadata = {
    name: generatorName,
    version: generatorVersion,
    commit: geenratorCommit,
  };
  await client.coverage.upload(generatorMetadata, coverage);

  logger.info(
    `${pc.green(
      "✓",
    )} Scenario coverage file "${coverageFile}" uploaded to ${storageAccountName} storage account for ${generatorName}@${generatorVersion}.`,
  );
}
