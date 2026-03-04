import { SmartObjectFunction } from './SmartObjectFunction'

interface FunctionResult {
  _rev?: string
  res?: {
    toString: () => string
  }
}

interface SmartObjectFunctionsProps {
  smartObject: {
    _id: string
    _rev: string
  }
  functionsExist: boolean
  options: string[]
  setFunctionResult: React.Dispatch<React.SetStateAction<FunctionResult | string>>
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  setModalTitle: React.Dispatch<React.SetStateAction<string>>
}

export const SmartObjectFunctions = ({
  smartObject,
  functionsExist,
  options,
  setFunctionResult,
  setShow,
  setModalTitle,
}: SmartObjectFunctionsProps) => {
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
