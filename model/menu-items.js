const menuObject = [
  {

       'pizza': [
                {
                  'name': 'thin-crust',
                  'toppings': ['pepperoni', 'sausage', 'peppers', 'olives'],
                  'sizeChoice': [
                            { '_id': 'small', 'price': 14 },
                            { '_id': 'medium', 'price': 16 },
                            { '_id': 'large', 'price': 18 },
                            { '_id': 'x-large', 'price': 20 }
                          ]
                    },
                    {
                      'name': 'medium-crust',
                      'toppings': ['pepperoni', 'sausage', 'peppers', 'olives'],
                      'sizeChoice': [
                                { '_id': 'small', 'price': 14 },
                                { '_id': 'medium', 'price': 16 },
                                { '_id': 'large', 'price': 18 },
                                { '_id': 'x-large', 'price': 20 }
                              ]
                          },
                        {
                          'name': 'deep-dish',
                          'toppings': ['pepperoni', 'sausage', 'peppers', 'olives'],
                          'sizeChoice': [
                                    { '_id': 'small', 'price': 14 },
                                    { '_id': 'medium', 'price': 16 },
                                    { '_id': 'large', 'price': 18 },
                                    { '_id': 'x-large', 'price': 20 }
                                  ]
                          },
                          {
                            'name': 'vegan-pizza',
                            'toppings': ['vegan-chorizo', 'rice-cheese', 'peppers', 'olives', 'vegan-bacon'],
                            'sizeChoice': [
                                      { '_id': 'small', 'price': 14 },
                                      { '_id': 'medium', 'price': 16 },
                                      { '_id': 'large', 'price': 18 },
                                      { '_id': 'x-large', 'price': 20 }
                                    ]

                            },
                            {
                              'name': 'paleo-crust-pizza',
                              'toppings': ['grass-fed-beef', 'bison-burger-bits','peppers', 'olives'],
                              'sizeChoice': [
                                        { '_id': 'small', 'price': 14 },
                                        { '_id': 'medium', 'price': 16 },
                                        { '_id': 'large', 'price': 18 },
                                        { '_id': 'x-large', 'price': 20 }
                                      ]

                              }
                 ]
              }
            ];


module.exports = menuObject;
