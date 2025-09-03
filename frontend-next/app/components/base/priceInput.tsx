import CurrencyInput, { CurrencyInputProps } from "react-currency-input-field";
import { ControllerRenderProps } from "react-hook-form";

type PriceInputProps = CurrencyInputProps & ControllerRenderProps;

export function PriceInput({
  onChange,
  onBlur,
  value,
  name,
  ref,
}: PriceInputProps) {
  return (
    <CurrencyInput
      id="price-input-library"
      name="price"
      placeholder="R$ 0,00"
      decimalsLimit={2}
      intlConfig={{ locale: "pt-BR", currency: "BRL" }}
      onValueChange={(value) => onChange(value)}
      onBlur={onBlur}
      value={value}
      ref={ref}
      className="bg-[#DFD0B8] text-[#222831] h-12 w-full px-3 rounded"
    />
  );
}
