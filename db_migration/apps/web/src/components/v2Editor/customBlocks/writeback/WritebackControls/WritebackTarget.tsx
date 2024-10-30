import { databaseImages } from '@/components/DataSourcesList'
import Dropdown from '@/components/Dropdown'
import { APIDataSources } from '@/hooks/useDatasources'
import { useCallback, useMemo } from 'react'

interface Props {
  value: string
  options: APIDataSources
  onChange: (value: string) => void
  disabled: boolean
}
function WritebackTarget(props: Props) {
  const current = useMemo(() => {
    const ds = props.options.find((ds) => ds.config.data.id === props.value)
    if (ds) {
      return {
        value: ds.config.data.id,
        label: ds.config.data.name,
        icon: databaseImages(ds.config.type),
      }
    }

    return null
  }, [props.options, props.value])

  const icon = useCallback(
    (value: string) => {
      const ds = props.options.find((ds) => ds.config.data.id === value)
      if (ds) {
        return (
          <img
            className="min-h-4 min-w-4 h-4 w-4 flex-none"
            src={databaseImages(ds.config.type)}
            alt="database icon"
          />
        )
      }

      return null
    },
    [props.options]
  )

  const onChange = useCallback(
    (value: string) => {
      const selected = props.options.find(
        (ds) => ds.config.data.id === value
      )
      if (selected) {
        props.onChange(selected.config.data.id)
      }
    },
    [props.options, props.onChange]
  )
  const options = useMemo(
    () =>
      props.options
        .map(({ config: dataSource }) => ({
          label: dataSource.data.name,
          value: dataSource.data.id,
        }))
        .toArray(),
    [props.options]
  )

  return (
    <Dropdown
      label="Target"
      options={options}
      placeholder="Select a data source"
      value={current?.value}
      onChange={onChange}
      icon={icon}
      disabled={props.disabled}
      bg="bg-primary-200"
      fg="text-gray-900"
    />
  )
}

export default WritebackTarget
