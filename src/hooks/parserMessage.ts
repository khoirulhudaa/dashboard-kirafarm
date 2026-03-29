type ParsedMessage =
  | { type: "TEXT"; data: string }
  | {
      type: "PRODUCT";
      data: {
        name: string;
        price: string;
        qty: string;
        image: string;
      };
    };

export const parseMessage = (msg: string): ParsedMessage => {
  if (msg.startsWith("[PRODUCT_CARD]")) {
    const parts = msg.split("|");
    return {
      type: "PRODUCT",
      data: {
        name: parts[1],
        price: parts[2],
        qty: parts[3],
        image: parts[4],
      }
    };
  }

  return { type: "TEXT", data: msg };
};