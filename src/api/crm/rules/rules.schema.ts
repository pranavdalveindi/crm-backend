// src/api/crm/rules/rules.schema.ts

export interface RuleFieldOption {
  field: string;
  label: string;
  type: "boolean" | "number" | "string" | "array_member" | "array_guest" | "absence";
  description: string;
  operators: string[];
  defaultOperator?: string;
  defaultValue?: any;
}

export interface EventTypeSchema {
  eventType: number;
  name: string;
  category: "Connectivity" | "Demographics" | "Viewership" | "Audio";
  description: string;
  fields: RuleFieldOption[];
}

export const RULE_SCHEMAS: EventTypeSchema[] = [
  {
    eventType: 36,
    name: "Connectivity",
    category: "Connectivity",
    description: "Device connection status and cellular signal strength events.",
    fields: [
      {
        field: "connectivity",
        label: "Connectivity Status",
        type: "boolean",
        description: "Whether the device is connected (true) or disconnected (false).",
        operators: ["equals", "not_equals"],
        defaultOperator: "equals",
        defaultValue: false,
      },
      {
        field: "strength",
        label: "Signal Strength",
        type: "number",
        description: "Cellular signal strength value (0 to 100).",
        operators: ["less_than", "less_than_or_equal", "greater_than", "greater_than_or_equal", "equals"],
        defaultOperator: "less_than",
        defaultValue: 20,
      },
    ],
  },
  {
    eventType: 3,
    name: "Member Declaration",
    category: "Demographics",
    description: "Household member button presses and active/inactive status events.",
    fields: [
      {
        field: "all_inactive",
        label: "All Members Inactive",
        type: "array_member",
        description: "Triggers if every declared member in the household is marked as inactive.",
        operators: ["all_inactive"],
        defaultOperator: "all_inactive",
      },
      {
        field: "active_count",
        label: "Active Members Count",
        type: "number",
        description: "Count of currently active members in the household.",
        operators: ["equals", "less_than", "greater_than", "less_than_or_equal"],
        defaultOperator: "equals",
        defaultValue: 0,
      },
      {
        field: "inactive_count",
        label: "Inactive Members Count",
        type: "number",
        description: "Count of inactive members in the household.",
        operators: ["equals", "greater_than", "less_than"],
        defaultOperator: "greater_than",
        defaultValue: 0,
      },
    ],
  },
  {
    eventType: 4,
    name: "Guest Declaration",
    category: "Demographics",
    description: "Guest presence and active guest count events.",
    fields: [
      {
        field: "guest_count",
        label: "Active Guests Count",
        type: "number",
        description: "Total number of active guests declared.",
        operators: ["equals", "greater_than", "less_than"],
        defaultOperator: "greater_than",
        defaultValue: 0,
      },
      {
        field: "has_guests",
        label: "Has Guests Present",
        type: "boolean",
        description: "Check if guest list is non-empty.",
        operators: ["equals", "not_equals"],
        defaultOperator: "equals",
        defaultValue: true,
      },
    ],
  },
  {
    eventType: 29,
    name: "Image Recognition (Recognized)",
    category: "Viewership",
    description: "TV content matching events where the channel image was successfully recognized.",
    fields: [
      {
        field: "status",
        label: "Recognition Status",
        type: "string",
        description: "Status string from image recognition server (e.g. 'recognized').",
        operators: ["equals", "not_equals"],
        defaultOperator: "equals",
        defaultValue: "recognized",
      },
      {
        field: "label",
        label: "Channel Name / Label",
        type: "string",
        description: "Matched TV channel name (e.g. 'Armenia TV', 'Public TV').",
        operators: ["equals", "contains", "not_equals"],
        defaultOperator: "equals",
        defaultValue: "Public TV",
      },
      {
        field: "confidence",
        label: "Recognition Confidence",
        type: "number",
        description: "AI confidence score between 0.0 and 1.0.",
        operators: ["less_than", "greater_than"],
        defaultOperator: "less_than",
        defaultValue: 0.8,
      },
    ],
  },
  {
    eventType: 30,
    name: "Image Recognition (Unrecognized)",
    category: "Viewership",
    description: "TV content matching events where the channel image could NOT be recognized.",
    fields: [
      {
        field: "status",
        label: "Recognition Status",
        type: "string",
        description: "Status string from image recognition server ('unrecognized').",
        operators: ["equals", "not_equals"],
        defaultOperator: "equals",
        defaultValue: "unrecognized",
      },
    ],
  },
  {
    eventType: 42,
    name: "Audio Fingerprint",
    category: "Audio",
    description: "Audio fingerprint matching events.",
    fields: [
      {
        field: "no_event",
        label: "Absence of Audio Fingerprints",
        type: "absence",
        description: "Triggers if no audio fingerprint events are logged for min_days.",
        operators: ["no_event"],
        defaultOperator: "no_event",
      },
      {
        field: "status",
        label: "Matching Status",
        type: "string",
        description: "Audio matching status.",
        operators: ["equals", "not_equals"],
        defaultOperator: "equals",
        defaultValue: "unmatched",
      },
    ],
  },
];

