import {
  state,
  style,
  trigger,
  transition,
  query,
  animate,
  group
} from '@angular/animations';

export const loginPageListShowHide = trigger('listShowTransition', [
  state('showList', style({})),
  state('hideList', style({})),
  transition('hideList => showList', [
    query(
      ':leave',
      style({
        opacity: 1,
        marginLeft: '0px',
        display: 'inline-block'
      })
    ),
    query(
      '.login',
      style({
        opacity: 1,
        marginLeft: 'auto',
        marginRight: 'auto',
        float: 'none'
      })
    ),
    query(':enter', style({ opacity: 0, width: 0 })),
    query(
      ':leave',
      animate(
        '200ms ease-in-out',
        style({
          opacity: 0,
          marginLeft: '-16px',
          display: 'inline-block'
        })
      )
    ),
    query(
      '.login',
      animate(
        '200ms 40ms ease-in-out',
        style({
          opacity: 0
        })
      )
    ),
    query(
      '.login',
      style({
        float: 'right'
      })
    ),
    query(
      ':enter',
      animate('300ms 20ms ease-in-out', style({ opacity: 1, width: '*' }))
    ),
    query(
      '.login',
      animate(
        '200ms 20ms ease-in-out',
        style({
          opacity: 1
        })
      )
    )
  ]),
  transition('showList => hideList', [
    query(
      ':enter',
      style({
        opacity: 0,
        marginLeft: '-16px',
        display: 'inline-block'
      })
    ),
    query(
      ':leave',
      style({
        opacity: 1,
        width: '*'
      })
    ),
    query(
      '.login',
      style({
        marginLeft: 0,
        opacity: 1
      })
    ),
    query(
      '.login',
      animate(
        '200ms ease-in-out',
        style({
          opacity: 0
        })
      )
    ),
    query(
      ':leave',
      animate(
        '300ms 20ms ease-in-out',
        style({
          opacity: 0,
          width: 0
        })
      )
    ),
    group(
      [
        query(
          '.login',
          style({
            marginLeft: '*'
          })
        ),
        query(
          '.login',
          animate(
            '200ms ease-in-out',
            style({
              marginLeft: '*',
              opacity: 1
            })
          )
        )
      ],
      { delay: '20ms' }
    ),
    query(
      ':enter',
      animate(
        '200ms 20ms ease-in-out',
        style({
          opacity: 1,
          marginLeft: '0'
        })
      )
    )
  ])
]);
