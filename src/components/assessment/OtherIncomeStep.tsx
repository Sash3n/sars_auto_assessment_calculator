"use client";

import type { RentalProperty } from "@/lib/tax-engine/rental";

type OtherIncomeStepProps = {
  rentalProperties: RentalProperty[];
  freelanceIncome: number;
  interestIncome: number;
  onRentalPropertiesChange: (properties: RentalProperty[]) => void;
  onFreelanceIncomeChange: (value: number) => void;
  onInterestIncomeChange: (value: number) => void;
};

export function createEmptyRentalProperty(): RentalProperty {
  return { income: 0, expenses: 0, areaLetFraction: 1, monthsLetFraction: 1 };
}

export function OtherIncomeStep({
  rentalProperties,
  freelanceIncome,
  interestIncome,
  onRentalPropertiesChange,
  onFreelanceIncomeChange,
  onInterestIncomeChange,
}: OtherIncomeStepProps) {
  function updateProperty(index: number, field: keyof RentalProperty, value: number) {
    const next = rentalProperties.map((property, i) =>
      i === index ? { ...property, [field]: value } : property,
    );
    onRentalPropertiesChange(next);
  }

  function removeProperty(index: number) {
    onRentalPropertiesChange(rentalProperties.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-base">Rental &amp; property income</h3>
          {rentalProperties.length === 0 && (
            <p className="text-sm text-base-content/60">No rental properties added.</p>
          )}
          {rentalProperties.map((property, index) => (
            <div
              key={index}
              className="grid grid-cols-2 gap-3 rounded-box border border-base-300 p-3 sm:grid-cols-5 sm:items-end"
            >
              <label className="form-control">
                <span className="label-text text-xs">Rental income</span>
                <input
                  type="number"
                  min={0}
                  className="input input-bordered input-sm"
                  aria-label={`Property ${index + 1} income`}
                  value={property.income === 0 ? "" : property.income}
                  onChange={(e) => updateProperty(index, "income", Number(e.target.value) || 0)}
                />
              </label>
              <label className="form-control">
                <span className="label-text text-xs">Deductible expenses</span>
                <input
                  type="number"
                  min={0}
                  className="input input-bordered input-sm"
                  aria-label={`Property ${index + 1} expenses`}
                  value={property.expenses === 0 ? "" : property.expenses}
                  onChange={(e) =>
                    updateProperty(index, "expenses", Number(e.target.value) || 0)
                  }
                />
              </label>
              <label className="form-control">
                <span className="label-text text-xs">% of property let</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input input-bordered input-sm"
                  aria-label={`Property ${index + 1} area let percent`}
                  value={property.areaLetFraction * 100}
                  onChange={(e) =>
                    updateProperty(index, "areaLetFraction", (Number(e.target.value) || 0) / 100)
                  }
                />
              </label>
              <label className="form-control">
                <span className="label-text text-xs">% of year let</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input input-bordered input-sm"
                  aria-label={`Property ${index + 1} months let percent`}
                  value={property.monthsLetFraction * 100}
                  onChange={(e) =>
                    updateProperty(
                      index,
                      "monthsLetFraction",
                      (Number(e.target.value) || 0) / 100,
                    )
                  }
                />
              </label>
              <button
                type="button"
                className="btn btn-ghost btn-sm text-error"
                onClick={() => removeProperty(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline btn-sm self-start"
            onClick={() =>
              onRentalPropertiesChange([...rentalProperties, createEmptyRentalProperty()])
            }
          >
            + Add property
          </button>
        </div>
      </section>

      <section className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-base">Freelance / business income</h3>
          <label className="form-control max-w-xs">
            <span className="label-text text-xs">Total for the tax year</span>
            <input
              type="number"
              min={0}
              className="input input-bordered input-sm"
              aria-label="Freelance income"
              value={freelanceIncome === 0 ? "" : freelanceIncome}
              onChange={(e) => onFreelanceIncomeChange(Number(e.target.value) || 0)}
            />
          </label>
        </div>
      </section>

      <section className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-base">Investment interest</h3>
          <label className="form-control max-w-xs">
            <span className="label-text text-xs">Gross interest received for the tax year</span>
            <input
              type="number"
              min={0}
              className="input input-bordered input-sm"
              aria-label="Interest income"
              value={interestIncome === 0 ? "" : interestIncome}
              onChange={(e) => onInterestIncomeChange(Number(e.target.value) || 0)}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
