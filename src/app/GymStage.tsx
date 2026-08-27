"use client";

/**
 * THE ROOM LIGHTS WHEN YOU CHOOSE A MACHINE (E10/S8, PM ruling RT-AH:a).
 *
 * The floor's own copy has promised this for months — "pick either, the room
 * follows" — and the product did not do it. `Machine.field` was populated for
 * every machine, documented as "ambient field colours while this machine is
 * selected", and read by nothing (found in E10/S4b). Selecting a machine moved
 * `--app-bg` by a couple of values and left the ambience exactly where it was.
 *
 * WHY THIS COMPONENT EXISTS. The field is painted by `FluidField`, absolutely
 * positioned against `<main>`; the selection lived in `GymFloor`, several
 * levels down and sandwiched between two blocks of page copy. A component
 * cannot colour its own grandparent, so the state had to come up rather than
 * the field go down.
 *
 * WHY CONTEXT AND NOT PROPS. The floor is not the last thing on the page — the
 * secondary doors follow it — so a single `children` slot cannot place it, and
 * carving the page into `above`/`below` props would make `page.tsx` a jigsaw
 * to serve this file's convenience. Context lets the page keep its own shape
 * and its own reading order. `useMachineSelection` throws outside a stage, so
 * a floor rendered somewhere this does not wrap fails loudly rather than
 * silently losing its lighting.
 *
 * WHAT CHANGES ON SELECTION, and why both: colour AND brightness. At rest the
 * gym is achromatic and dim (`GYM_FIELD` at `FIELD_CHOOSING`); a chosen machine
 * brings its own hue at the brightness an instrument runs at
 * (`FIELD_MEASURING`). The message is the product's own — the room has nothing
 * to say about you until you agree to be measured, and then it commits.
 *
 * THE EASING IS ALREADY BUILT. `FluidField` cross-fades two stacked layers
 * whenever `colors` change and transitions their opacity, so brightness eases
 * too. Nothing here animates anything by hand; it changes two props and the
 * primitive does what it was written to do (649cace).
 */

import { createContext, useContext, useState } from "react";
import FluidField from "@/components/FluidField";
import type { Machine } from "./GymFloor";
import { GYM_FIELD, FIELD_CHOOSING, FIELD_MEASURING } from "@/content/instrument-accents";

type Selection = {
  selected: string | null;
  select: (id: string | null) => void;
};

const SelectionContext = createContext<Selection | null>(null);

/** The floor's handle on the room. Throws outside a `GymStage`, on purpose. */
export function useMachineSelection(): Selection {
  const ctx = useContext(SelectionContext);
  if (!ctx) {
    throw new Error(
      "useMachineSelection() outside a <GymStage>. The floor's selection is what " +
        "lights the room; a floor rendered without a stage would look fine and " +
        "quietly do nothing, which is the defect E10/S8 exists to fix.",
    );
  }
  return ctx;
}

export default function GymStage({
  machines,
  children,
}: {
  machines: Machine[];
  /** The page's own copy and floor — server-rendered, passed straight through. */
  children: React.ReactNode;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const chosen = machines.find((m) => m.id === selected) ?? null;

  return (
    <SelectionContext.Provider value={{ selected, select: setSelected }}>
      <FluidField
        colors={chosen ? chosen.field : GYM_FIELD}
        intensity={chosen ? FIELD_MEASURING : FIELD_CHOOSING}
        scrim={false}
        vignette
      />
      {children}
    </SelectionContext.Provider>
  );
}
