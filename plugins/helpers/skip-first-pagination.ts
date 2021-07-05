// Modified version of `offsetLimitPagination` from Apollo

import type { FieldPolicy, Reference } from "@apollo/client/cache";

type KeyArgs = FieldPolicy<any>["keyArgs"];

// A basic field policy that uses options.args.{offset,limit} to splice
// the incoming data into the existing array. If your arguments are called
// something different (like args.{start,count}), feel free to copy/paste
// this implementation and make the appropriate changes.
export function skipFirstPagination<T = Reference>(keyArgs: KeyArgs = false): FieldPolicy<T[]> {
  return {
    keyArgs,
    merge(existing, incoming, { args }) {
      const merged = existing ? existing.slice(0) : [];
      if (args) {
        // Assume an skip of 0 if args.skip omitted.
        const { skip = 0 } = args;
        for (let i = 0; i < incoming.length; ++i) {
          merged[skip + i] = incoming[i];
        }
      } else {
        // It's unusual (probably a mistake) for a paginated field not
        // to receive any arguments, so you might prefer to throw an
        // exception here, instead of recovering by appending incoming
        // onto the existing array.
        //@ts-ignore
        merged.push.apply(merged, incoming);
      }
      return merged;
    },
  };
}
