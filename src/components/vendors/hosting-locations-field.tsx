import { Button } from "@/components/ui/button";
import TextInput from "@/components/form/input";
import type { IHostingLocation } from "@/lib/types/vendor.type";
import { TrashIcon } from "@phosphor-icons/react";

type HostingLocationsFieldProps = {
  locations: IHostingLocation[];
  onChange: (locations: IHostingLocation[]) => void;
};

export function HostingLocationsField({
  locations,
  onChange,
}: HostingLocationsFieldProps) {
  const updateLocation = (
    index: number,
    field: keyof IHostingLocation,
    value: string,
  ) => {
    const next = locations.map((location, i) =>
      i === index ? { ...location, [field]: value } : location,
    );
    onChange(next);
  };

  const addLocation = () => {
    onChange([...locations, { region: "", jurisdiction: "" }]);
  };

  const removeLocation = (index: number) => {
    if (locations.length === 1) return;
    onChange(locations.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-ink">
          Hosting locations
          <span className="text-red-500"> *</span>
        </label>
        <p className="text-sm text-text-secondary">
          Where does this vendor process or store your data? Add every region that applies.
        </p>
      </div>

      <div className="space-y-8">
        {locations.map((location, index) => (
          <div
            key={`hosting-${index}`}
            className="rounded-xl border border-hairline bg-white p-6 space-y-6"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-ink">Region {index + 1}</p>
              {locations.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-text-secondary"
                  onClick={() => removeLocation(index)}
                >
                  <TrashIcon size={16} />
                  Remove
                </Button>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <TextInput
                id={`region-${index}`}
                label="Region"
                placeholder="e.g. us-east-1, eu-west-1"
                required
                values={{ [`region-${index}`]: location.region }}
                handleChange={(e) => updateLocation(index, "region", e.target.value)}
              />
              <TextInput
                id={`jurisdiction-${index}`}
                label="Jurisdiction"
                placeholder="e.g. us, eu, uk"
                required
                values={{ [`jurisdiction-${index}`]: location.jurisdiction }}
                handleChange={(e) => updateLocation(index, "jurisdiction", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addLocation}>
        + Add another region
      </Button>
    </div>
  );
}
