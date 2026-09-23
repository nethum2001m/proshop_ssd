import React from 'react';
import { Helmet } from 'react-helmet';

const Meta = ({ title }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta
        name='description'
        content='We sell the best products at the best prices'
      />
      <meta
        name='keywords'
        content='electronics, best electronics, cheap electronics, buy electronics, best deals, discounted deals'
      />
    </Helmet>
  );
};

Meta.defaultProps = {
  title: 'Welcome to ProShop',
};

export default Meta;
