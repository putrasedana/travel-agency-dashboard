import { ComboBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import { Header } from "../../../components";
import type { Route } from "./+types/create-trip";
import { comboBoxItems, selectItems } from "~/constants";
import { cn, formatKey } from "~/lib/utils";
import { LayerDirective, LayersDirective, MapsComponent } from "@syncfusion/ej2-react-maps";
import React, { useState } from "react";
import { world_map } from "~/constants/world_map";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { account } from "~/appwrite/client";
import { useNavigate } from "react-router";

export const loader = async () => {
  const response = await fetch("https://restcountries.com/v3.1/all?fields=name,latlng,flags,cca2,maps");
  const data = await response.json();

  return data.map((country: any) => ({
    name: country.name.common,
    coordinates: country.latlng,
    value: country.name.common,
    openStreetMap: country.maps?.openStreetMaps,
    flag: country.cca2.toLowerCase(),
  }));
};

const CreateTrip = ({ loaderData }: Route.ComponentProps) => {
  const countries = loaderData as Country[];
  const navigate = useNavigate();

  const [formData, setFormData] = useState<TripFormData>({
    country: "",
    travelStyle: "",
    interest: "",
    budget: "",
    duration: 0,
    groupType: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const countryData = countries.map((country) => ({
    text: country.name,
    value: country.value,
    flag: country.flag,
  }));

  const mapData = [
    {
      country: formData.country,
      color: "#EA382E",
      coordinates: countries.find((c: Country) => c.name === formData.country)?.coordinates || [],
    },
  ];

  const handleChange = (key: keyof TripFormData, value: string | number) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!formData.country || !formData.travelStyle || !formData.interest || !formData.budget || !formData.groupType) {
      setError("Please provide values for all fields");
      setLoading(false);
      return;
    }

    if (formData.duration < 1 || formData.duration > 10) {
      setError("Duration must be between 1 and 10 days");
      setLoading(false);
      return;
    }

    const user = await account.get();
    if (!user.$id) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/create-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: formData.country,
          numberOfDays: formData.duration,
          travelStyle: formData.travelStyle,
          interest: formData.interest,
          budget: formData.budget,
          groupType: formData.groupType,
          userId: user.$id,
        }),
      });

      const result: CreateTripResponse = await response.json();

      if (result?.id) navigate(`/trips/${result.id}`);
      else console.error("Failed to generate a trip");
    } catch (error) {
      console.error("Error generating trip", error);
    } finally {
      setLoading(false);
    }
  };

  const itemTemplate = (data: any) => {
    return (
      <div className="flex items-center gap-1 px-3 py-2">
        <img
          src={`https://flagcdn.com/w40/${data.flag}.png`}
          alt={data.text}
          className="w-6 h-4 object-cover rounded-sm shadow-sm"
        />

        <span className="text-sm font-medium text-dark-300">{data.text}</span>
      </div>
    );
  };

  return (
    <main className="flex flex-col gap-10 pb-20 wrapper">
      <Header title="Add a New Trip" description="View and edit AI Generated travel plans" />

      <section className="mt-2.5 wrapper-md">
        <form onSubmit={handleSubmit} className="trip-form">
          <div className="">
            <label htmlFor="country">Country</label>
            <ComboBoxComponent
              id="country"
              dataSource={countryData}
              fields={{ text: "text", value: "value" }}
              placeholder="Select a Country"
              className="combo-box"
              itemTemplate={itemTemplate}
              change={(e: { value: string | undefined }) => {
                if (e.value) {
                  handleChange("country", e.value);
                }
              }}
              allowFiltering
              filtering={(e) => {
                const query = e.text.toLowerCase();

                e.updateData(
                  countries
                    .filter((country) => country.name.toLocaleLowerCase().includes(query))
                    .map((country) => ({
                      text: country.name,
                      value: country.value,
                      flag: country.flag,
                    })),
                );
              }}
            />
          </div>

          <div className="">
            <label htmlFor="duration">Duration</label>
            <input
              id="duration"
              name="duration"
              type="number"
              placeholder="Enter a number of days (5, 12 ...)"
              className="form-input placeholder:text-gray-100"
              onChange={(e) => handleChange("duration", Number(e.target.value))}
            />
          </div>

          {selectItems.map((key) => (
            <div key={key} className="">
              <label htmlFor={key}>{formatKey(key)}</label>

              <ComboBoxComponent
                id={key}
                dataSource={comboBoxItems[key].map((item) => ({
                  text: item,
                  value: item,
                }))}
                fields={{ text: "text", value: "value" }}
                placeholder={`Select ${formatKey(key)}`}
                change={(e: { value: string | undefined }) => {
                  if (e.value) {
                    handleChange(key, e.value);
                  }
                }}
                allowFiltering
                filtering={(e) => {
                  const query = e.text.toLowerCase();

                  e.updateData(
                    comboBoxItems[key]
                      .filter((item) => item.toLocaleLowerCase().includes(query))
                      .map((item) => ({
                        text: item,
                        value: item,
                      })),
                  );
                }}
                className="combo-box"
              />
            </div>
          ))}

          <div>
            <label htmlFor="location">Location on map</label>
            <MapsComponent>
              <LayersDirective>
                <LayerDirective
                  shapeData={world_map}
                  dataSource={mapData}
                  shapePropertyPath="name"
                  shapeDataPath="country"
                  shapeSettings={{ colorValuePath: "color", fill: "#E5E5E5" }}
                />
              </LayersDirective>
            </MapsComponent>
          </div>

          <div className="bg-gray-200 w-full h-px" />

          {error && (
            <div className="error">
              <p>{error}</p>
            </div>
          )}

          <footer className="px-6 w-full">
            <ButtonComponent type="submit" className="button-class h-12! w-full!" disabled={loading}>
              <img
                src={`/assets/icons/${loading ? "loader.svg" : "magic-star.svg"}`}
                alt="loading"
                className={cn("size-5", { "animate-spin": loading })}
              />
              <span className="p-16-semibold text-white">{loading ? "Generating ..." : "Generate Trip"}</span>
            </ButtonComponent>
          </footer>
        </form>
      </section>
    </main>
  );
};
export default CreateTrip;
