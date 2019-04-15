import chalk from 'chalk'
import { capitalize, forEach, isEmpty, omit, padEnd } from 'lodash'
import { basename } from 'path'

import { CommandFunction, ICommandsDictionary, Middleware } from '../index'
import { ILogger } from '../utils/logger'
import { optionToString } from '../utils/options'

export interface IOptionsAnnotations {
  [optionName: string]: string
}

export interface IHelpDetailedAnnoations {
  description?: string
  params?: string[]
  options?: IOptionsAnnotations
  [key: string]: any
}

export type HelpAnnotations = string | IHelpDetailedAnnoations

export const annotationsMap = new Map<CommandFunction, HelpAnnotations>()

function printCommandHelp(
  command: CommandFunction,
  namespace: string,
  logger: ILogger,
  argv: string[]
) {
  const help = annotationsMap.get(command)
  if (!help) {
    logger.log('Documentation not found')
    return
  }

  let annotations: IHelpDetailedAnnoations = {}

  if (typeof help === 'string') {
    annotations.description = help
  } else {
    annotations = help
  }

  const { description, params, options } = annotations
  const scriptName = namespace || basename(argv[1])
  const extra = omit(annotations, ['description', 'params', 'options'])
  const usageOptions = isEmpty(options) ? '' : '[options]'
  const usageParams =
    !Array.isArray(params) || isEmpty(params) ? '' : `[${params.join(' ')}]`

  logger.log(`Usage: ${scriptName} ${usageOptions} ${usageParams}\n`)

  if (description) {
    logger.log(`${description}\n`)
  }

  if (!isEmpty(options)) {
    logger.log('Options:\n')
    forEach(options, (value, key) => {
      logger.log(`  ${padEnd(optionToString(key), 12)}${value}`)
    })
  }

  forEach(extra, (value, key) => {
    logger.log(`\n${capitalize(key)}:\n`)
    logger.log(`${value}\n`)
  })
}

function printDefinitionHelp(
  definition: ICommandsDictionary,
  namespace: string,
  logger: ILogger
) {
  if (!namespace) {
    logger.log('\nCommands:\n')
  }
  Object.keys(definition)
    .sort()
    .forEach(key => {
      const node = definition[key]
      const nextNamespace = namespace ? `${namespace}:${key}` : key

      if (typeof node === 'function') {
        let annotations = annotationsMap.get(node)

        if (typeof annotations === 'string') {
          annotations = { description: annotations }
        }
        // Add task name
        const funcParams = annotations && annotations.params
        const logArgs = [chalk.bold(nextNamespace)]

        // Add task params
        if (Array.isArray(funcParams) && funcParams.length) {
          logArgs[0] += ` [${funcParams.join(' ')}]`
        }

        // Add description
        if (annotations && annotations.description) {
          const description = annotations.description
          logArgs[0] = padEnd(logArgs[0], 40) // format
          logArgs.push('-', description.split('\n')[0])
        }

        // Log
        logger.log(...logArgs)
      } else if (typeof node === 'object') {
        printDefinitionHelp(node, nextNamespace, logger)
      }
    })
}

export function help(command: CommandFunction, annotations: HelpAnnotations) {
  // Because the validation above currently gets compiled out,
  // Explictly  validate the function input
  if (typeof command === 'function') {
    annotationsMap.set(command, annotations)
  } else {
    throw new Error('First help() argument must be a function')
  }

  return command
}

export const helper: (logger: ILogger, argv: string[]) => Middleware = (
  logger,
  argv
) => next => args => {
  const { definition, options, command, namespace } = args
  if (!options.help) {
    return next(args)
  }

  if (command) {
    printCommandHelp(command, namespace, logger, argv)
  }

  if (
    namespace === '' &&
    typeof definition === 'object' &&
    (!command || command === definition.default)
  ) {
    printDefinitionHelp(definition, namespace, logger)
  }
}
