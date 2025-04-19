export default defineAppConfig({
  ui: {
    primary: "blue",
    gray: "slate",
    notifications: {
      // Show notifications at the top right
      position: "top-right",
    },
    modal: {
      // Use different transition for modal
      transition: {
        enterFrom: "opacity-0 scale-95",
        enterTo: "opacity-100 scale-100",
        leaveFrom: "opacity-100 scale-100",
        leaveTo: "opacity-0 scale-95",
      },
    },
    input: {
      default: {
        size: "md",
        color: "white",
      },
    },
    card: {
      background: "bg-gray-900",
      divide: "divide-gray-800",
      ring: "ring-1 ring-gray-700",
      rounded: "rounded-lg",
      shadow: "shadow-lg",
      body: {
        padding: "p-4",
        background: "",
      },
      header: {
        padding: "px-4 py-3",
        background: "bg-gray-800/50",
      },
      footer: {
        padding: "px-4 py-3",
        background: "bg-gray-800/50",
      },
    },
    select: {
      default: {
        color: "white",
      },
    },
    button: {
      default: {
        color: "gray",
      },
    },
  },
});
