import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposableCommands = [
        vscode.commands.registerCommand('ddd-generator.createProjectStructure', createProjectStructure),
        vscode.commands.registerCommand('ddd-generator.createEntity', createEntity),
        vscode.commands.registerCommand('ddd-generator.createRepository', createRepository),
        vscode.commands.registerCommand('ddd-generator.createUseCase', createUseCase),
        vscode.commands.registerCommand('ddd-generator.createController', createController)
    ];

    disposableCommands.forEach(cmd => context.subscriptions.push(cmd));
}

async function createProjectStructure() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('Abra uma pasta no VS Code antes de executar este comando.');
        return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const projectName = await vscode.window.showInputBox({ prompt: 'Nome do projeto' });

    if (!projectName) {
        vscode.window.showErrorMessage('Nome do projeto inválido.');
        return;
    }

    const projectPath = path.join(rootPath, projectName);
    const folders = [
        'Domain/Entities',
        'Domain/Repositories',
        'Application/UseCases',
        'Infrastructure/Data',
        'Infrastructure/Repositories',
        'API/Controllers'
    ];

    folders.forEach(folder => {
        fs.mkdirSync(path.join(projectPath, folder), { recursive: true });
    });

    fs.writeFileSync(path.join(projectPath, 'README.md'), '# Novo Projeto DDD\n');
    vscode.window.showInformationMessage(`Estrutura DDD criada para ${projectName}!`);
}

async function createEntity() {
    await createFileInFolder('Domain/Entities', 'Nome da entidade', (name) => 
        `export class ${name} {
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}`
    );
}

async function createRepository() {
    await createFileInFolder('Domain/Repositories', 'Nome do repositório', (name) => 
        `export interface I${name}Repository {
    findById(id: number): Promise<${name} | null>;
    save(entity: ${name}): Promise<void>;
}`
    );
}

async function createUseCase() {
    await createFileInFolder('Application/UseCases', 'Nome do caso de uso', (name) => 
        `import { I${name}Repository } from "../../Domain/Repositories/I${name}Repository";

export class ${name}UseCase {
    constructor(private repository: I${name}Repository) {}

    async execute(id: number) {
        return await this.repository.findById(id);
    }
}`
    );
}

async function createController() {
    await createFileInFolder('API/Controllers', 'Nome do controller', (name) => 
        `import { Request, Response } from "express";
import { ${name}UseCase } from "../../Application/UseCases/${name}UseCase";

export class ${name}Controller {
    constructor(private useCase: ${name}UseCase) {}

    async handle(request: Request, response: Response) {
        const { id } = request.params;
        const result = await this.useCase.execute(Number(id));
        return response.json(result);
    }
}`
    );
}

async function createFileInFolder(folder: string, prompt: string, templateFn: (name: string) => string) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('Abra uma pasta no VS Code antes de executar este comando.');
        return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const fileName = await vscode.window.showInputBox({ prompt: `Digite o ${prompt}` });

    if (!fileName) {
        vscode.window.showErrorMessage(`${prompt} inválido.`);
        return;
    }

    const filePath = path.join(rootPath, folder, `${fileName}.ts`);
    const fileContent = templateFn(fileName);

    fs.writeFileSync(filePath, fileContent);
    vscode.window.showInformationMessage(`${prompt} criado: ${fileName}.ts`);
}


export function deactivate() {}
