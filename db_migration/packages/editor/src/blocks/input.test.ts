import * as Y from 'yjs'
import { makeSQLBlock } from './sql.js'
import {
  BlockType,
  YBlock,
  getInputAttributes,
  isInputBlock,
  getInputValueExecStatus,
  getInputVariableExecStatus,
  makeInputBlock,
  updateInputLabel,
  updateInputValue,
  updateInputVariable,
} from './index.js'

describe('isYInputBlock', () => {
  it('should return true for Input blocks', () => {
    const ydoc = new Y.Doc()
    const blocks = ydoc.getMap<YBlock>('blocks')
    const inputBlock = makeInputBlock('blockId', blocks)
    blocks.set('blockId', inputBlock)

    expect(isInputBlock(inputBlock)).toBe(true)
  })

  it('should return false for non-Input blocks', () => {
    const ydoc = new Y.Doc()
    const blocks = ydoc.getMap<YBlock>('blocks')
    const sqlBlock = makeSQLBlock('blockId', blocks)
    blocks.set('blockId', sqlBlock)

    expect(isInputBlock(sqlBlock)).toBe(false)
  })
})

describe('makeInputBlock', () => {
  it('should create a Input block with valid empty state', () => {
    const ydoc = new Y.Doc()
    const blocks = ydoc.getMap<YBlock>('blocks')
    const inputBlock = makeInputBlock('blockId', blocks)
    blocks.set('blockId', inputBlock)

    expect(inputBlock.getAttribute('type')).toBe(BlockType.Input)
    expect(inputBlock.getAttribute('id')).toBe('blockId')
    expect(inputBlock.getAttribute('label')?.toString()).toBe('Input 1')
    expect(inputBlock.getAttribute('value')).toEqual({
      value: '',
      newValue: '',
      status: 'idle',
      error: null,
    })
    expect(inputBlock.getAttribute('variable')).toEqual({
      value: 'input_1',
      newValue: 'input_1',
      status: 'idle',
      error: null,
    })
    expect(inputBlock.getAttribute('inputType')).toBe('text')
  })

  it('should find an available variable name', () => {
    const ydoc = new Y.Doc()
    const blocks = ydoc.getMap<YBlock>('blocks')
    const inputBlock1 = makeInputBlock('blockId1', blocks)
    blocks.set('blockId1', inputBlock1)

    const inputBlock2 = makeInputBlock('blockId2', blocks)
    blocks.set('blockId2', inputBlock2)

    expect(inputBlock1.getAttribute('variable')?.value).toBe('input_1')
    expect(inputBlock2.getAttribute('variable')?.value).toBe('input_2')
  })
})

describe('updateInputLabel', () => {
  it('should update the label of an Input block', () => {
    const ydoc = new Y.Doc()
    const blocks = ydoc.getMap<YBlock>('blocks')
    const inputBlock = makeInputBlock('blockId', blocks)
    blocks.set('blockId', inputBlock)

    expect(inputBlock.getAttribute('label')).toBe('Input 1')

    updateInputLabel(inputBlock, 'New label')
    expect(inputBlock.getAttribute('label')).toBe('New label')
  })
})

describe('updateInputValue', () => {
  it('should update the values of the value prop of an Input block', () => {
    const ydoc = new Y.Doc()
    const blocks = ydoc.getMap<YBlock>('blocks')
    const inputBlock = makeInputBlock('blockId', blocks)
    blocks.set('blockId', inputBlock)

    expect(inputBlock.getAttribute('value')).toEqual({
      value: '',
      newValue: '',
      status: 'idle',
      error: null,
    })

    updateInputValue(inputBlock, {
      newValue: 'New value',
      status: 'save-requested',
    })
    expect(inputBlock.getAttribute('value')).toEqual({
      value: '',
      newValue: 'New value',
      status: 'save-requested',
      error: null,
    })
  })
})

describe('getInputValueExecStatus', () => {
  it('should return false when the status is idle', () => {
    const ydoc = new Y.Doc()
    const blocks = ydoc.getMap<YBlock>('blocks')
    const inputBlock = makeInputBlock('blockId', blocks)
    blocks.set('blockId', inputBlock)

    updateInputValue(inputBlock, { status: 'idle' })
    expect(getInputValueExecStatus(inputBlock)).toBe('idle')
  })

  it('should return true when the status is save-requested', () => {
    const ydoc = new Y.Doc()
    const blocks = ydoc.getMap<YBlock>('blocks')
    const inputBlock = makeInputBlock('blockId', blocks)
    blocks.set('blockId', inputBlock)

    updateInputValue(inputBlock, { status: 'save-requested' })
    expect(getInputValueExecStatus(inputBlock)).toBe('loading')
  })

  it('should return true when the status is saving', () => {
    const ydoc = new Y.Doc()
    const blocks = ydoc.getMap<YBlock>('blocks')
    const inputBlock = makeInputBlock('blockId', blocks)
    blocks.set('blockId', inputBlock)

    updateInputValue(inputBlock, { status: 'saving' })
    expect(getInputValueExecStatus(inputBlock)).toBe('loading')
  })
})

describe('updateInputVariable', () => {
  it('should update the variable of an Input block', () => {
    const ydoc = new Y.Doc()
    const blocks = ydoc.getMap<YBlock>('blocks')
    const inputBlock = makeInputBlock('blockId', blocks)
    blocks.set('blockId', inputBlock)

    updateInputVariable(inputBlock, blocks, {
      newValue: 'input_2',
      status: 'save-requested',
    })
    expect(inputBlock.getAttribute('variable')).toEqual({
      value: 'input_1',
      newValue: 'input_2',
      status: 'save-requested',
      error: null,
    })
  })
})

describe('getInputVariableExecStatus', () => {
  it('should return false when the status is idle', () => {
    const ydoc = new Y.Doc()
    const blocks = ydoc.getMap<YBlock>('blocks')
    const inputBlock = makeInputBlock('blockId', blocks)
    blocks.set('blockId', inputBlock)

    updateInputVariable(inputBlock, blocks, { status: 'idle' })
    expect(getInputVariableExecStatus(inputBlock, blocks)).toBe('idle')
  })

  it('should return true when the status is save-requested', () => {
    const ydoc = new Y.Doc()
    const blocks = ydoc.getMap<YBlock>('blocks')
    const inputBlock = makeInputBlock('blockId', blocks)
    blocks.set('blockId', inputBlock)

    updateInputVariable(inputBlock, blocks, { status: 'save-requested' })
    expect(getInputVariableExecStatus(inputBlock, blocks)).toBe('loading')
  })

  it('should return true when the status is saving', () => {
    const ydoc = new Y.Doc()
    const blocks = ydoc.getMap<YBlock>('blocks')
    const inputBlock = makeInputBlock('blockId', blocks)
    blocks.set('blockId', inputBlock)

    updateInputVariable(inputBlock, blocks, { status: 'saving' })
    expect(getInputVariableExecStatus(inputBlock, blocks)).toBe('loading')
  })
})

describe('getInputAttributes', () => {
  it('should return the attributes of an Input block', () => {
    const ydoc = new Y.Doc()
    const blocks = ydoc.getMap<YBlock>('blocks')
    const inputBlock = makeInputBlock('blockId', blocks)
    blocks.set('blockId', inputBlock)

    const attributes = getInputAttributes(inputBlock, blocks)
    expect(attributes).toEqual({
      id: 'blockId',
      index: null,
      title: '',
      type: BlockType.Input,
      label: 'Input 1',
      variable: {
        value: 'input_1',
        newValue: 'input_1',
        status: 'idle',
        error: null,
      },
      value: {
        value: '',
        newValue: '',
        status: 'idle',
        error: null,
      },
      inputType: 'text',
      executedAt: null,
    })
  })
})
