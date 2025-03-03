import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposableCommands = [
        vscode.commands.registerCommand('ddd-generator.createProjectStructure', createProjectStructure),
        vscode.commands.registerCommand('ddd-generator.createEntity', createEntity),
        vscode.commands.registerCommand('ddd-generator.createRepository', createRepository),
        vscode.commands.registerCommand('ddd-generator.createUseCase', createUseCase),
        vscode.commands.registerCommand('ddd-generator.createController', createController),
        vscode.commands.registerCommand('ddd-generator.changeLanguage', changeLanguage) // Corrigido aqui
    ];

    disposableCommands.forEach(cmd => context.subscriptions.push(cmd));
}

async function changeLanguage() {
    const options = ['typescript', 'csharp', 'java'];
    const selectedLanguage = await vscode.window.showQuickPick(options, {
        placeHolder: 'Escolha a linguagem para o gerador de código',
    }) || '';

    if (selectedLanguage) {
        const config = vscode.workspace.getConfiguration('ddd-generator');
        await config.update('language', selectedLanguage, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Linguagem do gerador de código alterada para: ${selectedLanguage}`);
    }
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
    const config = vscode.workspace.getConfiguration('ddd-generator');
    
    const language = config.get<string>('language') ?? 'typescript';

    let packageName = '';
    let packagePath = '';
    if (language === 'java') {
        // Solicitar o nome do pacote para Java
        packageName = (await vscode.window.showInputBox({
            prompt: 'Nome do pacote (ex: com.example.domain)',
            placeHolder: 'com.example.domain'
        })) ?? '';

        if (!packageName) {
            vscode.window.showErrorMessage('Nome do pacote inválido.');
            return;
        }
        packagePath = packageName.replace(/\./g, '/'); // Converte "com.example.domain" em "com/example/domain"
    }
    await config.update('packageName', packageName, vscode.ConfigurationTarget.Global);

    let folders: string[];
    switch (language) {
        case 'csharp':
            folders = [
                'Domain/Entities',
                'Domain/Repositories',
                'Application/UseCases',
                'Infrastructure/Data',
                'Infrastructure/Repositories',
                'API/Controllers',
                'API/Models',
                'API/Services'
            ];
            break;
        case 'java':
            // Para Java, usamos o nome do pacote para criar a estrutura de pastas
            folders = [
                `src/main/java/${packagePath}/domain/model/entities`,
                `src/main/java/${packagePath}/application/usecases`,
                `src/main/java/${packagePath}/infrastructure/repositories`,
                `src/main/java/${packagePath}/api/controllers`,
            ];
            break;
        default: // TypeScript
            folders = [
                'Domain/Entities',
                'Domain/Repositories',
                'Application/UseCases',
                'Infrastructure/Data',
                'Infrastructure/Repositories',
                'API/Controllers'
            ];
            break;
    }

    // Criar as pastas
    folders.forEach(folder => {
        fs.mkdirSync(path.join(projectPath, folder), { recursive: true });
    });

    // Criar um arquivo README.md
    fs.writeFileSync(path.join(projectPath, 'README.md'), `# Novo Projeto DDD (${language})\n`);

    // Abrir a pasta do projeto no VS Code
    const projectUri = vscode.Uri.file(projectPath);
    await vscode.commands.executeCommand('vscode.openFolder', projectUri);

    vscode.window.showInformationMessage(`Estrutura DDD criada para ${projectName} (${language})!`);
}

async function createEntity() {
    await createFileInFolder('Domain/Entities', 'Nome da entidade', generateEntityTemplate);
}

async function createRepository() {
    await createFileInFolder('Domain/Repositories', 'Nome do repositório', generateRepositoryTemplate);
}

async function createUseCase() {
    await createFileInFolder('Application/UseCases', 'Nome do caso de uso', generateUseCaseTemplate);
}

async function createController() {
    await createFileInFolder('API/Controllers', 'Nome do controller', generateControllerTemplate);
}

async function createFileInFolder(folder: string, prompt: string, templateFn: (name: string, lang: string) => string) {
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

    const config = vscode.workspace.getConfiguration('ddd-generator');
    const language = config.get<string>('language') ?? 'typescript';

    let extension: string;
    let fullFolderPath: string;

    if (language === 'csharp') {
        extension = 'cs';
        fullFolderPath = path.join(rootPath, folder);
    } else if (language === 'java') {
        extension = 'java';
        // Para Java, usamos o nome do pacote para construir o caminho da pasta
        const packageName = config.get<string>('packageName') ?? 'br.com.example.domain';
        const packagePath = packageName.replace(/\./g, '/'); // Converte "com.example.domain" em "com/example/domain"
        
        // Ajuste para a nova estrutura de pastas
        if (folder === 'Domain/Entities') {
            fullFolderPath = path.join(rootPath, 'src/main/java', packagePath, 'domain/model/entities');
        } else if (folder === 'Domain/Repositories') {
            fullFolderPath = path.join(rootPath, 'src/main/java', packagePath, '/infrastructure/repositories');
        } else if (folder === 'Application/UseCases') {
            fullFolderPath = path.join(rootPath, 'src/main/java', packagePath, 'application/usecases');
        } else if (folder === 'API/Controllers') {
            fullFolderPath = path.join(rootPath, 'src/main/java', packagePath, 'api/controllers');
        } else {
            fullFolderPath = path.join(rootPath, folder);
        }
    } else {
        extension = 'ts';
        fullFolderPath = path.join(rootPath, folder);
    }

    // Garantir que a pasta exista
    if (!fs.existsSync(fullFolderPath)) {
        fs.mkdirSync(fullFolderPath, { recursive: true });
    }

    // Caminho completo do arquivo
    const filePath = path.join(fullFolderPath, `${fileName}.${extension}`);

    // Gerar o conteúdo do arquivo
    const fileContent = templateFn(fileName, language);

    // Escrever o arquivo
    fs.writeFileSync(filePath, fileContent);
    vscode.window.showInformationMessage(`${prompt} criado: ${fileName}.${extension}`);
}

function generateEntityTemplate(name: string, lang: string): string {
    switch (lang) {
        case 'csharp':
            return `namespace Domain.Entities {
    public class ${name} {
        public int Id { get; set; }
        // Add other properties here
    }
}`;
        case 'java':
            return `package domain.model.entities;

public class ${name} {
    private int id;
    // Add other properties here

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}`;
        default:
            return `export class ${name} {
    id: number;
    // Add other properties here
}`;
    }
}

function generateRepositoryTemplate(name: string, lang: string): string {
    switch (lang) {
        case 'csharp':
            return `namespace Domain.Repositories {
    public interface I${name}Repository {
        ${name}? FindById(int id);
        void Save(${name} entity);
    }
}`;
        case 'java':
            return `package domain.repositories;

public interface I${name}Repository {
    ${name} findById(int id);
    void save(${name} entity);
}`;
        default:
            return `export interface I${name}Repository {
    findById(id: number): Promise<${name} | null>;
    save(entity: ${name}): Promise<void>;
}`;
    }
}

function generateUseCaseTemplate(name: string, lang: string): string {
    switch (lang) {
        case 'csharp':
            return `using Domain.Repositories;

namespace Application.UseCases {
    public class ${name}UseCase {
        private readonly I${name}Repository _repository;

        public ${name}UseCase(I${name}Repository repository) {
            _repository = repository;
        }

        public ${name}? Execute(int id) {
            return _repository.FindById(id);
        }
    }
}`;
        case 'java':
            return `package application.usecases;

import domain.repositories.I${name}Repository;

public class ${name}UseCase {
    private final I${name}Repository repository;

    public ${name}UseCase(I${name}Repository repository) {
        this.repository = repository;
    }

    public ${name} execute(int id) {
        return repository.findById(id);
    }
}`;
        default:
            return `import { I${name}Repository } from "../../Domain/Repositories/I${name}Repository";

export class ${name}UseCase {
    constructor(private repository: I${name}Repository) {}

    async execute(id: number) {
        return await this.repository.findById(id);
    }
}`;
    }
}

function generateControllerTemplate(name: string, lang: string): string {
    switch (lang) {
        case 'csharp':
            return `using Microsoft.AspNetCore.Mvc;
using Application.UseCases;

namespace API.Controllers {
    [ApiController]
    [Route("[controller]")]
    public class ${name}Controller : ControllerBase {
        private readonly ${name}UseCase _useCase;

        public ${name}Controller(${name}UseCase useCase) {
            _useCase = useCase;
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id) {
            var result = _useCase.Execute(id);
            return Ok(result);
        }
    }
}`;
        case 'java':
            return `package api.controllers;

import application.usecases.${name}UseCase;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/${name.toLowerCase()}")
public class ${name}Controller {
    private final ${name}UseCase useCase;

    public ${name}Controller(${name}UseCase useCase) {
        this.useCase = useCase;
    }

    @GetMapping("/{id}")
    public Object get(@PathVariable int id) {
        return useCase.execute(id);
    }
}`;
        default:
            return `import { Request, Response } from "express";
import { ${name}UseCase } from "../../Application/UseCases/${name}UseCase";

export class ${name}Controller {
    constructor(private useCase: ${name}UseCase) {}

    async handle(request: Request, response: Response) {
        const { id } = request.params;
        const result = await this.useCase.execute(Number(id));
        return response.json(result);
    }
}`;
    }
}

export function deactivate() {}
