// Snapshot of the first-team lists published by the clubs. See docs/club-data.md.
// Names, squad numbers and broad roles are source facts; game ratings are separate.
export const ROSTER_VERSION = '2026-09-25';
export const rosterDate = '25 september 2026';
export const roleLabels = { GK:'Keeper', DEF:'Verdediger', MID:'Middenvelder', ATT:'Aanvaller' };
const squad = (position, rows) => rows.map(([number,name]) => ({number,name,position}));
export const clubData = [
  {name:'Ajax',slug:'ajax',source:'https://www.ajax.nl/teams/ajax-1',players:[
    ...squad('GK',[[1,'Marc ter Stegen'],[22,'Joeri Heerkens'],[26,'Maarten Paes']]),
    ...squad('DEF',[[2,'Lucas Rosa'],[3,'Anton Gaaei'],[5,'Owen Wijndal'],[6,'Thilo Kehrer'],[12,'Caio Henrique'],[15,'Youri Baas'],[17,'Daley Blind'],[21,'Jofre Torrents'],[30,'Aaron Bouwman'],[36,'Dies Janse']]),
    ...squad('MID',[[4,'Sofyan Amrabat'],[8,'Julian Brandt'],[10,'Oscar Gloukh'],[18,'Davy Klaassen'],[24,'Jorthy Mokio'],[28,'Yves Bissouma']]),
    ...squad('ATT',[[7,'Simon Adingra'],[9,'Kasper Dolberg'],[11,'Viktor Tsygankov'],[20,'Oliver Edvardsen'],[23,'Steven Berghuis'],[38,'Marcos Leonardo'],[43,'Rayane Bounida'],[99,'Tolu Arokodare']])
  ]},
  {name:'Feyenoord',slug:'feyenoord',source:'https://www.feyenoord.com/nl/teams/feyenoord-1/selectie',players:[
    ...squad('GK',[[1,'Tjark Ernst'],[33,'Florian Kastenmeier'],[39,'Liam Bossin'],[37,'Mannou Berger']]),
    ...squad('DEF',[[2,'Bart Nieuwkoop'],[3,'Thomas Beelen'],[4,'Tsuyoshi Watanabe'],[5,'Gijs Smal'],[6,'Jeremiah St. Juste'],[15,'Jordan Bos'],[16,'Javi López'],[20,'Mats Deijl'],[24,'Thijs Kraaijeveld'],[26,'Givairo Read'],[35,'Mika Mármol']]),
    ...squad('MID',[[7,'Jakub Moder'],[8,'Gjivai Zechiël'],[10,'Luciano Valente'],[14,'Sem Steijn'],[22,'Tobias van den Elshout'],[28,'Oussama Targhalline'],[34,'Charles Vanhoutte']]),
    ...squad('ATT',[[11,'Gonçalo Borges'],[17,'Reiss Nelson'],[23,'Anis Hadj Moussa'],[27,'Gaoussou Diarra'],[19,'Nacho Ferri'],[49,'Shaqueel van Persie']])
  ]},
  {name:'PSV',slug:'psv',source:'https://www.psv.nl/teams/team',players:[
    ...squad('GK',[[1,'Nick Olij'],[32,'Matej Kovár'],[51,'Tijn Smolenaars']]),
    ...squad('DEF',[[2,'Lutsharel Geertruida'],[3,'Yarek Gasiorowski'],[4,'Armando Obispo'],[6,'Ryan Flamingo'],[8,'Sergiño Dest'],[17,'Mauro Júnior'],[18,'Filip Kostic'],[25,'Kiliann Sildillia'],[38,'Fabian Merién']]),
    ...squad('MID',[[10,'Paul Wanner'],[20,'Guus Til'],[21,'Sven Mijnans'],[22,'Jerdy Schouten'],[24,'Kodai Sano'],[31,'Noah Fernandez'],[35,'Ayoni Santos']]),
    ...squad('ATT',[[5,'Ivan Perišic'],[7,'Ruben van Bommel'],[9,'Ricardo Pepi'],[11,'Sami Ouaissa'],[14,'Alassane Pléa'],[19,'Esmir Bajraktarevic'],[23,'Mikkel Bro Hansen'],[27,'Dennis Man'],[29,'Sam Lammers']])
  ]},
  {name:'AZ',slug:'az',source:'https://www.az.nl/teams/az',players:[
    ...squad('GK',[[1,'Rome-Jayden Owusu-Oduro'],[12,'Hobie Verhulst'],[28,'Jari De Busser'],[41,'Jeroen Zoet']]),
    ...squad('DEF',[[2,'Seiya Maikuma'],[3,'Wouter Goes'],[4,'Lewis Schouten'],[5,'Mateo Chávez'],[20,'Andrea Natali'],[22,'Elijah Dijkstra'],[29,'Wesley Hoedt'],[30,'Denso Kasius'],[31,'Rion Ichihara'],[34,'Mees de Wit']]),
    ...squad('MID',[[6,'Peer Koopmeiners'],[8,'Jordy Clasie'],[10,'Kees Smit'],[16,'Stije Resink'],[17,'Valdemar Byskov'],[21,'Dave Kwakman']]),
    ...squad('ATT',[[7,'Weslley Patati'],[9,'Mexx Meerdink'],[11,'Ro-Zangelo Daal'],[14,'Calvin Stengs'],[19,'Jizz Hornkamp'],[24,'Ayoub Oufkir'],[44,'Wassim Bouziane'],[45,'Bendegúz Kovács']])
  ]},
  {name:'FC Utrecht',slug:'utrecht',source:'https://www.fcutrecht.nl/teams/selectie',players:[
    ...squad('GK',[[1,'Vasilis Barkas'],[22,'Sergio Padt'],[31,'Mees Eppink'],[33,'Kevin Gadellaa']]),
    ...squad('DEF',[[2,'Siebe Horemans'],[3,'Matisse Didden'],[5,'Nikolas Panayiotou'],[18,'Jakov Medić'],[21,'Neville Ogidi Nwankwo'],[32,'Per Kloosterboer']]),
    ...squad('MID',[[6,'Guus Offerhaus'],[8,'Joris van Overeem'],[20,'Dani de Wit'],[23,'Niklas Vesterlund'],[27,'Alonzo Engwanda'],[30,'Kevin Paredes'],[34,'Davy van den Berg'],[38,'Oualid Agougil'],[39,'Nordin Amrabat'],[92,'Arthur Zagré']]),
    ...squad('ATT',[[7,'Victor Jensen'],[9,'Artem Stepanov'],[10,'Yoann Cathline'],[11,'Ángel Alarcón'],[15,'Adrian Blake'],[17,'Sem van Duijn'],[26,'Miliano Jonathans'],[29,'Noah Ohio'],[47,'Emmanuel Chigozie Owen'],[80,'Marius Broholm']])
  ]},
  {name:'FC Twente',slug:'twente',source:'https://fctwente.nl/teams/eerste-selectie/spelers',players:[
    ...squad('GK',[[1,'Lars Unnerstall'],[16,'Joël Drommel'],[22,'Remko Pasveer'],[31,'Yannick Gerritsen']]),
    ...squad('DEF',[[2,'Michal Rosiak'],[3,'Robin Pröpper'],[4,'Ruud Nijstad'],[23,'Stav Lemkin'],[24,'Krzysztof Kurowski'],[28,'Bart van Rooij'],[29,'Aske Adelgaard'],[38,'Max Bruns']]),
    ...squad('MID',[[6,'Ramiz Zerrouki'],[8,'Daouda Weidmann'],[14,'Kristian Hlynsson'],[18,'Jordy Bawuah'],[20,'Thomas van den Belt'],[41,'Gijs Besselink']]),
    ...squad('ATT',[[7,'Marko Pjaca'],[9,'Wout Weghorst'],[10,'Younes Taha'],[11,'Daan Rots'],[17,'Filip Thorvaldsen'],[25,'Lucas Vennegoor of Hesselink'],[27,'Sondre Ørjasæter'],[37,'Naci Ünüvar']])
  ]}
];

export const clubInfo = name => clubData.find(club=>club.name===name);
// Also use this identity when excluding scouting candidates from existing squads.
export function playerIdentity(name) {
  const normalized=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ø/g,'o').replace(/æ/g,'ae').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  return ({'marc-andre-ter-stegen':'marc-ter-stegen'})[normalized]||normalized;
}
