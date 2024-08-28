import { useSignal } from "@preact/signals";
import chroma from "chroma-js";
import { Eye, MapIcon, XIcon } from "lucide-react";
import { useCallback } from "preact/compat";
import WorldMap, { CountryContext } from "react-svg-worldmap";
import { appInfo } from "../../../../app";
import { ApiEvent } from "../../../../shared";
import { Visualization, VizContext } from "../../../../util/viz/v_viz";

type _Ctxt = VizContext<ApiEvent, {}>;
export const mapViz: Visualization<{}> = {
  id: "map",
  types: "all",
  label: "Map",
  icon: <MapIcon />,
  options: [],
  defaults: {},
  builder: (c) => <_MapViz c={c} />,
};

function _MapViz({ c }: { c: _Ctxt }) {
  const countrySig = useSignal<any>(null);

  const clickAction = useCallback(
    ({ countryCode, countryName }: CountryContext) => {
      countrySig.value = { code: countryCode, name: countryName };
    },
    []
  );

  const getStyle = ({ countryValue, maxValue }: CountryContext) => {
    const colorScale = chroma
      .scale(["#00000022", appInfo.style.accentColor])
      .mode("lch");
    return {
      // set string of the hex color with opacity based on the country value
      fill: countryValue
        ? colorScale(0.3 + (countryValue / maxValue) * 0.7).hex()
        : "#00000022",
      stroke: "white",
      cursor: "pointer",
    };
  };

  const countryData = c.events.reduce((p, ev) => {
    if (ev.meta.location.country) {
      const country = p.find((c) => c.country === ev.meta.location.country);
      if (country) {
        country.value += 1;
      } else {
        p.push({ country: ev.meta.location.country, value: 1 });
      }
    }
    return p;
  }, []);

  return (
    <div class="column cross-center">
      <div style="margin: -40px 0">
        <WorldMap
          data={countryData}
          color={appInfo.style.accentColor}
          backgroundColor="transparent"
          valuePrefix=":"
          valueSuffix=" events"
          size={500}
          styleFunction={getStyle}
          onClickFunction={clickAction}
        />
      </div>

      <_CityList
        country={countrySig.value}
        events={c.events}
        onClose={() => (countrySig.value = null)}
        onSelect={(city) => {
          c.setFilter(
            [
              {
                local: false,
                field: "meta.location.city",
                operator: "=",
                value: city,
              },
              {
                local: false,
                field: "meta.location.country",
                operator: "=",
                value: countrySig.value.code,
              },
            ],
            true
          );
        }}
      />
      <span class="text-s" style={"text-align: end; width: 100%"}>
        resolved with a local copy of{" "}
        <a class="b" href="https://db-ip.com">
          DB-IP
        </a>
      </span>
    </div>
  );
}

function _CityList({
  country,
  events,
  onClose,
  onSelect,
}: {
  country: { code: string; name: string } | null;
  events: ApiEvent[];
  onClose?: () => void;
  onSelect?: (city: string) => void;
}) {
  if (!country) return null;

  const cities = events
    .filter((ev) => ev.meta.location.country === country.code)
    .reduce((p, event) => {
      const city = event.meta.location.city;
      const cityEvents = p?.find((c) => c.city === city)?.events;
      if (cityEvents) {
        cityEvents.push(event);
      } else {
        p.push({ city: city, events: [event] });
      }
      return p;
    }, []);

  const maxLength = cities.reduce((p, c) => Math.max(p, c.events.length), 0);

  return (
    <div class="column cross-stretch-fill">
      <div class="row main-space-between">
        <h4 class="margin-none">places in {country.name}</h4>
        <button class="integrated" onClick={onClose}>
          <XIcon />
        </button>
      </div>
      <div class="column cross-stretch gap-quarter">
        {cities.map((ev) => (
          <div class="row t-row highlightable">
            <div class="flex-1 b">{ev.city}</div>
            <div class="flex-2">
              <div
                class="loud card text-s b"
                style={`padding: 0.3rem; width: max(10rem,${
                  (ev.events.length / maxLength) * 100
                }%); `}
              >
                {ev.events.length} events
              </div>
            </div>
            <div class="row cross-end">
              <button
                class="integrated
              "
                onClick={() => onSelect(ev.city)}
              >
                <Eye /> view
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
