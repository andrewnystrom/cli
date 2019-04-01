import { CLICommandNotFound } from '../../src/errors'
import { interpret } from '../../src/interpreter'

describe('interpreter', () => {
  let commandsModule: any

  describe('when commandsModule object given', () => {
    beforeEach(() => {
      commandsModule = {
        a: jest.fn(),
        b: {
          c: jest.fn(),
          d: {
            e: jest.fn()
          },
          default: jest.fn()
        },
        f: {},
        default: jest.fn()
      }
    })

    describe('with no namespace in task name', () => {
      it('calls command', () => {
        interpret({ options: {}, params: ['a'], commandsModule })
        expect(commandsModule.a).toHaveBeenCalledTimes(1)
        expect(commandsModule.a).toHaveBeenCalledWith({})
      })

      it('calls default command', () => {
        interpret({ options: {}, params: [], commandsModule })
        expect(commandsModule.default).toHaveBeenCalledTimes(1)
        expect(commandsModule.default).toHaveBeenCalledWith({})
      })

      it('calls command with params', () => {
        interpret({
          commandsModule,
          options: {},
          params: ['a', 'arg1', 'arg2']
        })
        expect(commandsModule.a).toHaveBeenCalledTimes(1)
        expect(commandsModule.a).toHaveBeenCalledWith({}, 'arg1', 'arg2')
      })

      it('calls default command with params', () => {
        interpret({
          commandsModule,
          options: {},
          params: ['arg1', 'arg2']
        })
        expect(commandsModule.default).toHaveBeenCalledTimes(1)
        expect(commandsModule.default).toHaveBeenCalledWith({}, 'arg1', 'arg2')
      })

      it('calls command with options', () => {
        const options = { op1: 'o1', op2: 'o2' }
        interpret({
          commandsModule,
          options,
          params: ['a']
        })
        expect(commandsModule.a).toHaveBeenCalledTimes(1)
        expect(commandsModule.a).toHaveBeenCalledWith(options)
      })

      it('calls default command with options', () => {
        const options = { op1: 'o1', op2: 'o2' }
        interpret({
          commandsModule,
          options,
          params: []
        })
        expect(commandsModule.default).toHaveBeenCalledTimes(1)
        expect(commandsModule.default).toHaveBeenCalledWith(options)
      })

      it('throws error if no default command and command not found', () => {
        delete commandsModule.default
        expect(() => {
          interpret({
            commandsModule,
            options: {},
            params: ['arg1', 'arg2']
          })
        }).toThrow(CLICommandNotFound)
      })
    })

    describe('with namespace in task name', () => {
      it('calls command from name space', () => {
        interpret({ options: {}, params: ['b:c'], commandsModule })
        expect(commandsModule.b.c).toHaveBeenCalledTimes(1)
        expect(commandsModule.b.c).toHaveBeenCalledWith({})
      })

      it('calls default command from name space', () => {
        interpret({ options: {}, params: ['b'], commandsModule })
        expect(commandsModule.b.default).toHaveBeenCalledTimes(1)
        expect(commandsModule.b.default).toHaveBeenCalledWith({})
      })

      it('calls command from name space with options', () => {
        const options = { op1: 'o1', op2: 'o2' }
        interpret({
          commandsModule,
          options,
          params: ['b:c']
        })
        expect(commandsModule.b.c).toHaveBeenCalledTimes(1)
        expect(commandsModule.b.c).toHaveBeenCalledWith(options)
      })

      it('calls default command from name space with options', () => {
        const options = { op1: 'o1', op2: 'o2' }
        interpret({
          commandsModule,
          options,
          params: ['b']
        })
        expect(commandsModule.b.default).toHaveBeenCalledTimes(1)
        expect(commandsModule.b.default).toHaveBeenCalledWith(options)
      })

      it('throws error if no default command and command from name space not found', () => {
        expect(() => {
          interpret({
            commandsModule,
            options: {},
            params: ['f', 'arg1', 'arg2']
          })
        }).toThrow(CLICommandNotFound)
      })
    })
  })

  describe('when function as commandsModule given', () => {
    beforeEach(() => {
      commandsModule = jest.fn()
    })

    it('calls command', () => {
      interpret({ options: {}, params: [], commandsModule })
      expect(commandsModule).toHaveBeenCalledTimes(1)
      expect(commandsModule).toHaveBeenCalledWith({})
    })

    it('calls command with params', () => {
      interpret({ options: {}, params: ['a', 'b'], commandsModule })
      expect(commandsModule).toHaveBeenCalledTimes(1)
      expect(commandsModule).toHaveBeenCalledWith({}, 'a', 'b')
    })

    it('calls command with options', () => {
      const options = { op1: 'o1', op2: 'o2' }
      interpret({ options, params: [], commandsModule })
      expect(commandsModule).toHaveBeenCalledTimes(1)
      expect(commandsModule).toHaveBeenCalledWith(options)
    })
  })
})
