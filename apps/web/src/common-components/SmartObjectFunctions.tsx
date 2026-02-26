import { SmartObjectFunction } from './SmartObjectFunction'

interface SmartObjectData {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  [key: string]: unknown
}

export const SmartObjectFunctions = ({
  smartObject,
  functionsExist,
  options,
  setFunctionResult,
  setShow,
  setModalTitle,
}: {
  smartObject: SmartObjectData
  functionsExist: boolean
  options: string[]
  setFunctionResult: React.Dispatch<React.SetStateAction<Record<string, unknown> | string>>
  setShow: (flag: boolean) => void
  setModalTitle: React.Dispatch<React.SetStateAction<string>>
}) => {
  if (!functionsExist) return <></>
  return (
    <>
      {Object.getOwnPropertyNames(Object.getPrototypeOf(smartObject))
        .filter(
          (key) =>
            key !== 'constructor' && typeof Object.getPrototypeOf(smartObject)[key] === 'function',
        )
        .map((key, fnIndex) => (
            <div key={fnIndex}>
              <SmartObjectFunction
                funcName={key}
                smartObject={smartObject}
                functionsExist={functionsExist}
                options={options}
                setFunctionResult={setFunctionResult}
                setShow={setShow}
                setModalTitle={setModalTitle}
              ></SmartObjectFunction>
            </div>
          ))}
    </>
  )
}
