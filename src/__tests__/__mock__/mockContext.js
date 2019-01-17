const context = {
  loading: true,
};

export const MyContext = {
  Consumer(props) {
    return props.children(context);
  },
};
