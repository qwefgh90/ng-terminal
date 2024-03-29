/**
 *
 * It is a CSI sequences generator
 * https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h2-Functions-using-CSI-_-ordered-by-the-final-character_s_
 */
let CSI = '\x9b';

export class FunctionsUsingCSI {
  static get CSI() {
    return CSI;
  }

  /**
   *  CSI Ps @  Insert Ps (Blank) Character(s) (default = 1) (ICH).
   *
   * */
  static insertBlank(count: number) {
    return `${CSI}${count}@`;
  }
  /**
   *  CSI Ps SP @ */
  /**
   *  CSI Ps A  Cursor Up Ps Times (default = 1) (CUU).
   * \x9b3A */
  static cursorUp(count: number) {
    return `${CSI}${count}A`;
  }
  /**
   *  CSI Ps SP A */
  /**
   *  CSI Ps B  Cursor Down Ps Times (default = 1) (CUD).
   * \x9b3B */
  static cursorDown(count: number) {
    return `${CSI}${count}B`;
  }
  /**
   *  CSI Ps C  Cursor Forward Ps Times (default = 1) (CUF).
   * \x9b3C */
  static cursorForward(count: number) {
    return `${CSI}${count}C`;
  }
  /**
   *  CSI Ps D  Cursor Backward Ps Times (default = 1) (CUB).
   * \x9b3D */
  static cursorBackward(count: number) {
    return `${CSI}${count}D`;
  }
  /**
   *  CSI Ps E  Cursor Next Line Ps Times (default = 1) (CNL).
   * \x9b3E
   * */
  static cursorNextLine(count: number) {
    return `${CSI}${count}E`;
  }
  /**
   *  CSI Ps F  Cursor Preceding Line Ps Times (default = 1) (CPL).
   * \x9b3F
   *  */
  static cursorPrecedingLine(count: number) {
    return `${CSI}${count}F`;
  }
  /**
   *  CSI Ps G  Cursor Character Absolute  [column] (default = [row,1]) (CHA).
   *  \x9b9G
   *  */
  static cursorColumn(count: number) {
    return `${CSI}${count}G`;
  }
  /**
   *  CSI Ps ; Ps H  Cursor Position [row;column] (default = [1,1]) (CUP).
   * \x9b2;2H
   * */
  static cursorPosition(row: number, col: number) {
    return `${CSI}${row};${col}H`;
  }
  /**
   *  CSI Ps I  Cursor Forward Tabulation Ps tab stops (default = 1) (CHT). */
  /**
   *  CSI Ps J  Erase in Display (ED), VT100.
   *      Ps = 0  -> Erase Below (default).
   *      Ps = 1  -> Erase Above.
   *      Ps = 2  -> Erase All.
   *      Ps = 3  -> Erase Saved Lines (xterm).
   * \x9b2J
   *  */
  static eraseInDisplay(category: KindOfEraseInDisplay) {
    return `${CSI}${category}J`;
  }

  /**
   *  CSI ? Ps J
   *  Erase in Display (DECSED), VT220.
   *    Ps = 0  -> Selective Erase Below (default).
   *    Ps = 1  -> Selective Erase Above.
   *    Ps = 2  -> Selective Erase All.
   *    Ps = 3  -> Selective Erase Saved Lines (xterm).
   * \x9b?2J
   * */
  static eraseSelectiveThingsInDisplay(category: KindOfEraseInDisplay) {
    return `${CSI}?${category}J`;
  }
  /**
   *  CSI Ps K
   *   Erase in Line (EL), VT100.
   *     Ps = 0  -> Erase to Right (default).
   *     Ps = 1  -> Erase to Left.
   *     Ps = 2  -> Erase All.
   * \x9b?1K
   * */
  static eraseInLine(category: KindOfEraseInLine) {
    return `${CSI}${category}K`;
  }
  /**
   *  CSI ? Ps K
   *    Erase in Line (DECSEL), VT220.
   *      Ps = 0  -> Selective Erase to Right (default).
   *      Ps = 1  -> Selective Erase to Left.
   *      Ps = 2  -> Selective Erase All.
   * \x9b?1K
   * */
  static eraseSelectiveThingsInLine(category: KindOfEraseInLine) {
    return `${CSI}?${category}K`;
  }
  /**
   *  CSI Ps L  Insert Ps Line(s) (default = 1) (IL).
   * \x9b2L
   *  */
  static insertLines(count: number) {
    return `${CSI}${count}L`;
  }
  /**
   *  CSI Ps M  Delete Ps Line(s) (default = 1) (DL).
   * \x9b2M
   *  */
  static deleteLines(count: number) {
    return `${CSI}${count}M`;
  }
  /**
   *  CSI Ps P  Delete Ps Character(s) (default = 1) (DCH).
   * \x9b2P
   *  */
  static deleteCharacter(count: number) {
    return `${CSI}${count}P`;
  }
  /**
   *  CSI Ps S  Scroll up Ps lines (default = 1) (SU), VT420, ECMA-48.
   * \x9b2S
   *  */
  static scrollUpLines(count: number) {
    return `${CSI}${count}S`;
  }
  /**
   *  CSI ? Pi ; Pa ; Pv S */
  /**
   *  CSI Ps T  Scroll down Ps lines (default = 1) (SD), VT420.
   * \x9b2T
   * */
  static scrollDownLines(count: number) {
    return `${CSI}${count}T`;
  }
  /**
   *  CSI Ps ; Ps ; Ps ; Ps ; Ps T */
  /**
   *  CSI > Ps ; Ps T */
  /**
   *  CSI Ps X  Erase Ps Character(s) (default = 1) (ECH).
   * \x9b2X
   *  */
  static eraseCharacters(count: number) {
    return `${CSI}${count}X`;
  }
  /**
   *  CSI Ps Z  Cursor Backward Tabulation Ps tab stops (default = 1) (CBT).
   * \x9b2Z
   * */
  static cursorBackwardTabulationPstabstops(count: number) {
    return `${CSI}${count}Z`;
  }
  /**
   *  CSI Ps ^  Scroll down Ps lines (default = 1) (SD), ECMA-48.
   * \x9b2^
   * */
  static scrolldownPslines(count: number) {
    return `${CSI}${count}^`;
  }
  /**
   *  CSI Ps `  Character Position Absolute  [column] (default = [row,1])
   * \x9b1` */
  static characterPositionAbsolute(count: number) {
    return `${CSI}${count}\``;
  }
  /**
   *  CSI Ps a  Character Position Relative  [columns] (default = [row,col+1])
   * \x9b1a */
  static characterPositionRelative(count: number) {
    return `${CSI}${count}a`;
  }
  /**
   *  CSI Ps b  Repeat the preceding graphic character Ps times (REP).
   * \x9b1b
   * */
  static repeatThePrecedingGraphicCharacter(count: number) {
    return `${CSI}${count}b`;
  }
  /**
   *  CSI Pm d  Line Position Absolute  [row] (default = [1,column]) (VPA). 
   * \x9b4d
   * */
  static linePositionAbsolute(count: number) {
    return `${CSI}${count}d`;
  }
  /**
   *  CSI Pm e  Line Position Relative  [rows] (default = [row+1,column]) 
   * \x9b1e
   * */
  static linePositionRelative(count: number) {
    return `${CSI}${count}e`;
  }
  /**
   *  CSI Ps ; Ps f  Horizontal and Vertical Position [row;column] (default =
   *       [1,1]) 
   * \x9b3;5f
   * */
  static horizontalandVerticalPosition(row: number, column: number) {
    return `${CSI}${row};${column}f`;
  }

  /**
   *  CSI Ps g  Tab Clear (TBC). 
   * \x9b3g
   * */
  /**
   *  CSI Pm h  Set Mode (SM).
   *  \x9b4h
   *  */
  static setMode(mode: KindOfSetMode, ...additionalModes: KindOfSetMode[]) {
    const modes = [mode, ...(additionalModes ?? [])];
    return `${CSI}${modes.join(";")}h`;
  }
  /**
   *  CSI ? Pm h  DEC Private Mode Set (DECSET).
   * */
  /**
   *  CSI Pm i  Media Copy (MC). */
  /**
   *  CSI ? Pm i */
  /**
   *  CSI Pm l  Reset Mode (RM). 
   * \x9b4l
   * */
  static resetMode(mode: KindOfResetMode, ...additionalModes: KindOfResetMode[]) {
    const modes = [mode, ...(additionalModes ?? [])];
    return `${CSI}${modes.join(";")}l`;
  }
  /**
   *  CSI ? Pm l */
  /**
   *  CSI Pm m  Character Attributes (SGR).
   * \x9b31m
   * */
  static characterAttributes(
    firstAttribute: KindOfCharacterAttributes,
    ...additionalAttributes: KindOfCharacterAttributes[]
  ) {
    const chars: KindOfCharacterAttributes[] = [
      firstAttribute,
      ...(additionalAttributes ?? []),
    ];
    return `${CSI}${chars.join(';')}m`;
  }
  /**
   *  CSI > Ps ; Ps m */
  /**
   *  CSI Ps n  Device Status Report (DSR). */
  /**
   *  CSI > Ps n */
  /**
   *  CSI ? Ps n */
  /**
   *  CSI > Ps p */
  /**
   *  CSI ! p   Soft terminal reset (DECSTR), VT220 and up. */
  /**
   *  CSI Ps ; Ps " p */
  /**
   *  CSI Ps $ p */
  /**
   *  CSI ? Ps $ p */
  /**
   *  CSI # p */
  /**
   *  CSI Ps ; Ps # p */
  /**
   *  CSI Ps q  Load LEDs (DECLL), VT100. */
  /**
   *  CSI Ps SP q */
  /**
   *  CSI Ps " q */
  /**
   *  CSI # q   Pop video attributes from stack (XTPOPSGR), xterm.  This is an */
  /**
   *  CSI Ps ; Ps r */
  /**
   *  CSI ? Pm r */
  /**
   *  CSI Pt ; Pl ; Pb ; Pr ; Ps $ r */
  /**
   *  CSI s     Save cursor, available only when DECLRMM is disabled (SCOSC, */
  /**
   *  CSI Pl ; Pr s */
  /**
   *  CSI ? Pm s */
  /**
   *  CSI Ps ; Ps ; Ps t */
  /**
   *  CSI > Ps ; Ps t */
  /**
   *  CSI Ps SP t */
  /**
   *  CSI Pt ; Pl ; Pb ; Pr ; Ps $ t */
  /**
   *  CSI u     Restore cursor (SCORC, also ANSI.SYS). */
  /**
   *  CSI Ps SP u */
  /**
   *  CSI Pt ; Pl ; Pb ; Pr ; Pp ; Pt ; Pl ; Pp $ v */
  /**
   *  CSI Ps $ w */
  /**
   *  CSI Pt ; Pl ; Pb ; Pr ' w */
  /**
   *  CSI Ps x  Request Terminal Parameters (DECREQTPARM). */
  /**
   *  CSI Ps * x */
  /**
   *  CSI Pc ; Pt ; Pl ; Pb ; Pr $ x */
  /**
   *  CSI Ps # y */
  /**
   *  CSI Pi ; Pg ; Pt ; Pl ; Pb ; Pr * y */
  /**
   *  CSI Ps ; Pu ' z */
  /**
   *  CSI Pt ; Pl ; Pb ; Pr $ z */
  /**
   *  CSI Pm ' { */
  /**
   *  CSI # { */
  /**
   *  CSI Ps ; Ps # { */
  /**
   *  CSI Pt ; Pl ; Pb ; Pr $ { */
  /**
   *  CSI Pt ; Pl ; Pb ; Pr # | */
  /**
   *  CSI Ps $ | */
  /**
   *  CSI Ps ' | */
  /**
   *  CSI Ps * | */
  /**
   *  CSI # }   Pop video attributes from stack (XTPOPSGR), xterm.  Popping */
  /**
   *  CSI Pm ' } */
  /**
   *  CSI Pm ' ~ */
}
export enum KindOfEraseInDisplay {
  Below = 0,
  Above = 1,
  All = 2,
  SavedLines = 3,
}
export enum KindOfEraseInLine {
  Right = 0,
  Left = 1,
  All = 2,
}

export enum KindOfTabClear{
    ClearCurrentColumn = 0,
    ClearAll = 3
}


export enum KindOfSetMode{
    KeyboardActionMode = 2,
    InsertMode = 4,
    SendReceive = 12,
    AutomaticNewline = 20
}
export enum KindOfResetMode{
    KeyboardActionMode = 2,
    ReplaceMode = 4,
    SendReceive = 12,
    NormalNewline = 20
}
export enum KindOfCharacterAttributes {
  Normal = 0,
  Bold = 1,
  Faint = 2,
  Italicized = 3,
  Underlined = 4,
  Blink = 5,
  Inverse = 7,
  Invisible = 8,
  CrossedOutcharacters = 9,
  DoublyUnderlined = 21,
  NormalNeitherBoldNorFaint = 22,
  Notitalicized = 23,
  Notunderlined = 24,
  Steady = 25,
  Positive = 27,
  Visible = 28,
  NotcrossedOut = 29,
  SetforegroundcolortoBlack = 30,
  SetforegroundcolortoRed = 31,
  SetforegroundcolortoGreen = 32,
  SetforegroundcolortoYellow = 33,
  SetforegroundcolortoBlue = 34,
  SetforegroundcolortoMagenta = 35,
  SetforegroundcolortoCyan = 36,
  SetforegroundcolortoWhite = 37,
  Setforegroundcolortodefault = 39,
  SetbackgroundcolortoBlack = 40,
  SetbackgroundcolortoRed = 41,
  SetbackgroundcolortoGreen = 42,
  SetbackgroundcolortoYellow = 43,
  SetbackgroundcolortoBlue = 44,
  SetbackgroundcolortoMagenta = 45,
  SetbackgroundcolortoCyan = 46,
  SetbackgroundcolortoWhite = 47,
  SetbackgroundcolortoDefault = 49,
}
