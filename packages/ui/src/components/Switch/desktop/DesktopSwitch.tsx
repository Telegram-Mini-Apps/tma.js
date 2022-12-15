import {SwitchBase} from '../base';

import styles from './styles.scss';
import withStyles from '../../../styles/customStyles';

/**
 * Switch used on Desktop platform.
 * @param props
 * @constructor
 */
export const DesktopSwitch = withStyles(styles, SwitchBase);