import CurrencyInput, { CurrencyInputProps } from "react-currency-input-field";
import { ControllerRenderProps } from "react-hook-form";

type PriceInputProps = CurrencyInputProps & ControllerRenderProps;

export function PriceInput({ onChange, onBlur, value, ref }: PriceInputProps) {
  return (
    <CurrencyInput
      id="price-input-library"
      name="price"
      placeholder="R$ 0,00"
      decimalsLimit={2}
      decimalScale={2}
      intlConfig={{ locale: "pt-BR", currency: "BRL" }}
      onValueChange={(value) => onChange(value)}
      onBlur={onBlur}
      value={value}
      ref={ref}
      className="h-12 w-full rounded bg-[#DFD0B8] px-3 text-[#222831]"
    />
  );
}
