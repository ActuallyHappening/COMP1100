[
	{
		code: 'COMP1100',
		cp: 2,
		id: course:comp1100,
		incompatible: [
			course:comp7110
		],
		name: 'Introduction to Software Innovation',
		prerequisites: [
			course:csse1001,
			'OR',
			course:deco1400
		],
		sem_1: true,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'COMP2011',
		cp: 2,
		id: course:comp2011,
		incompatible: [
			course:data2001,
			course:data7001
		],
		name: 'Fundamentals of Data Science',
		prerequisites: [
			[
				course:csse1001,
				'OR',
				course:engg1001
			],
			'AND',
			course:infs1200
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'COMP2048',
		cp: 2,
		id: course:comp2048,
		incompatible: [],
		name: 'Theory of Computing',
		prerequisites: [
			course:math1061,
			'AND',
			[
				course:csse1001,
				'OR',
				course:engg1001
			]
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'COMP2140',
		cp: 2,
		id: course:comp2140,
		incompatible: [],
		name: 'Web/Mobile Programming',
		prerequisites: [
			course:deco1400,
			'AND',
			[
				course:csse1001,
				'OR',
				course:engg1001
			]
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'COMP3301',
		cp: 2,
		id: course:comp3301,
		incompatible: [
			course:comp3300,
			course:comp7303,
			course:comp7308
		],
		name: 'Operating System Architecture',
		prerequisites: [
			course:comp2303,
			'OR',
			course:csse2310
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'COMP3320',
		cp: 2,
		id: course:comp3320,
		incompatible: [],
		name: 'Vulnerability Assessment and Penetration Testing',
		prerequisites: [
			[
				course:csse2310,
				'OR',
				course:csse7231
			],
			'AND',
			[
				course:cybr3000,
				'OR',
				course:coms3000,
				'OR',
				course:cybr7002
			]
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'COMP3400',
		cp: 2,
		id: course:comp3400,
		incompatible: [],
		name: 'Functional and Logic Programming',
		prerequisites: [
			[
				course:math1061,
				'OR',
				course:math1081
			],
			'AND',
			course:csse2002
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'COMP3506',
		cp: 2,
		id: course:comp3506,
		incompatible: [
			course:comp2502,
			course:comp7505
		],
		name: 'Algorithms and Data Structures',
		prerequisites: [
			course:csse2002,
			'AND',
			[
				course:math1061,
				'OR',
				[
					course:csse2010,
					'AND',
					course:stat2202
				]
			]
		],
		sem_1: true,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'COMP3702',
		cp: 2,
		id: course:comp3702,
		incompatible: [
			course:comp3701,
			course:comp7701,
			course:comp7702
		],
		name: 'Artificial Intelligence',
		prerequisites: [
			course:csse1001,
			'OR',
			course:csse7030,
			'OR',
			couse:engg1001
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'COMP3710',
		cp: 2,
		id: course:comp3710,
		incompatible: [],
		name: 'Pattern Recognition and Analysis',
		prerequisites: [
			[
				course:math1051,
				'OR',
				course:math1071
			],
			'AND',
			[
				course:csse1001,
				'OR',
				course:engg1001
			]
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'COMP3820',
		cp: 2,
		id: course:comp3820,
		incompatible: [
			course:comp3000
		],
		name: 'Digital Health Software Project',
		prerequisites: [
			[
				course:csse2002,
				'OR',
				course:csse7023,
				'OR',
				course:comp2140,
				'OR',
				course:csse2310,
				'OR',
				course:csse7231
			],
			'AND',
			[
				course:deco2500,
				'OR',
				course:deco7250,
				'OR',
				course:bioe6901
			]
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'COMP4403',
		cp: 2,
		id: course:comp4403,
		incompatible: [
			course:comp7402
		],
		name: 'Compilers and Interpreters',
		prerequisites: [
			course:comp3506
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'COMP4702',
		cp: 2,
		id: course:comp4702,
		incompatible: [
			course:comp7703
		],
		name: 'Machine Learning',
		prerequisites: [
			[
				course:csse1001,
				'OR',
				course:engg1001
			],
			'AND',
			[
				course:math1051,
				'OR',
				course:math1071
			],
			'AND',
			[
				course:stat1201,
				'OR',
				course:stat1301,
				'OR',
				course:stat2003,
				'OR',
				course:stat2201,
				'OR',
				course:stat2202,
				'OR',
				course:stat2203
			]
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'COMP4703',
		cp: 2,
		id: course:comp4703,
		incompatible: [],
		name: 'Natural Language Processing',
		prerequisites: [
			[
				course:math1061,
				'OR',
				course:math1081
			],
			'AND',
			[
				course:stat1201,
				'OR',
				course:stat1301,
				'OR',
				course:stat2203,
				'OR',
				course:stat2003,
				'OR',
				course:stat2201
			],
			'AND',
			[
				course:csse1001,
				'OR',
				course:engg1001
			]
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'COMS3200',
		cp: 2,
		id: course:coms3200,
		incompatible: [
			course:coms7201
		],
		name: 'Computer Networks I',
		prerequisites: [
			course:comp2303,
			'OR',
			course:csse2310
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'COSC2500',
		cp: 2,
		id: course:cosc2500,
		incompatible: [
			course:math2200,
			course:cosc7500
		],
		name: 'Numerical Methods in Computational Science',
		prerequisites: [
			course:scie1000,
			'OR',
			[
				course:csse1001,
				'AND',
				[
					course:math1051,
					'OR',
					course:math1071
				]
			],
			'OR',
			[
				[
					course:math1051,
					'OR',
					course:math1071
				],
				'AND',
				[
					course:math1052,
					'OR',
					course:math1072
				]
			]
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'COSC3000',
		cp: 2,
		id: course:cosc3000,
		incompatible: [
			course:math2303
		],
		name: 'Visualisation, Computer Graphics & Data Analysis',
		prerequisites: [
			course:cosc2500,
			'OR',
			course:csse2002
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'COSC3500',
		cp: 2,
		id: course:cosc3500,
		incompatible: [
			course:cosc7502
		],
		name: 'High-Performance Computing',
		prerequisites: [
			course:cosc2500,
			'OR',
			course:csse2002,
			'OR',
			course:csse2010,
			'OR',
			course:csse2310,
			'OR',
			course:phys3071,
			'OR',
			course:math2504
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'CRIM1000',
		cp: 2,
		id: course:crim1000,
		incompatible: [
			course:socy1040,
			course:crim7000
		],
		name: 'Introduction to Criminology',
		prerequisites: [],
		sem_1: true,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'CSSE1001',
		cp: 2,
		id: course:csse1001,
		incompatible: [
			course:comp1502,
			course:csse7030,
			course:engg1001
		],
		name: 'Introduction to Software Engineering',
		prerequisites: [],
		sem_1: true,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'CSSE2002',
		cp: 2,
		id: course:csse2002,
		incompatible: [
			course:comp2500,
			course:comp7908,
			course:csse7023
		],
		name: 'Programming in the Large',
		prerequisites: [
			course:csse1001,
			'OR',
			course:engg1001
		],
		sem_1: true,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'CSSE2010',
		cp: 2,
		id: course:csse2010,
		incompatible: [
			course:comp1300,
			course:comp2303,
			course:comp2302,
			course:csse1000,
			course:csse7035,
			course:csse7201,
			course:elec2002
		],
		name: 'Introduction to Computer Systems',
		prerequisites: [
			course:csse1001,
			'OR',
			course:engg1001
		],
		sem_1: true,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'CSSE2310',
		cp: 2,
		id: course:csse2310,
		incompatible: [
			course:comp2303,
			course:comp7306,
			course:csse7231
		],
		name: 'Computer Systems Principles and Programming',
		prerequisites: [
			[
				course:csse1001,
				'OR',
				course:engg1001
			]
		],
		sem_1: true,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'CSSE3012',
		cp: 2,
		id: course:csse3012,
		incompatible: [
			course:comp3500,
			course:comp7503,
			course:csse3002,
			course:csse7001
		],
		name: 'The Software Process',
		prerequisites: [
			[
				[
					course:comp2140,
					'OR',
					course:csse2002
				],
				'AND',
				[
					course:deco2500,
					'OR',
					course:deco2800,
					'OR',
					course:deco2850
				]
			],
			'OR',
			course:csse3200
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'CSSE3100',
		cp: 2,
		id: course:csse3100,
		incompatible: [
			course:csse7100
		],
		name: 'Reasoning About Programs',
		prerequisites: [
			[
				course:math1061,
				'OR',
				course:math1081
			],
			'AND',
			course:csse2002
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'CSSE3200',
		cp: 2,
		id: course:csse3200,
		incompatible: [
			course:deco2800
		],
		name: 'Software Engineering Studio: Design, Implement and Test',
		prerequisites: [
			course:csse2002
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'CYBR3000',
		cp: 2,
		id: course:cybr3000,
		incompatible: [
			course:coms3000,
			course:coms7003,
			course:cybr7002
		],
		name: 'Information Security',
		prerequisites: [
			course:csse2310,
			'OR',
			course:csse7231
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'DECO1100',
		cp: 2,
		id: course:deco1100,
		incompatible: [
			course:deco7110,
			course:ienv1000,
			course:ienv1301,
			course:ienv7911,
			course:ienv7913
		],
		name: 'Design Thinking',
		prerequisites: [],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'DECO1400',
		cp: 2,
		id: course:deco1400,
		incompatible: [
			course:deco7140,
			course:ienv7961,
			course:mmds1400,
			course:mmds7961
		],
		name: 'Introduction to Web Design',
		prerequisites: [],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'DECO1800',
		cp: 2,
		id: course:deco1800,
		incompatible: [
			course:deco7180
		],
		name: 'Design Computing Studio 1 - Interactive Technology',
		prerequisites: [
			course:deco1400
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'DECO2300',
		cp: 2,
		id: course:deco2300,
		incompatible: [
			course:deco7230
		],
		name: 'Digital Prototyping and Extended Reality',
		prerequisites: [
			course:deco2500,
			'AND',
			[
				course:csse1001,
				'OR',
				course:engg1001
			]
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'DECO2500',
		cp: 2,
		id: course:deco2500,
		incompatible: [
			course:comp2506,
			course:comp3501,
			course:comp7904,
			course:deco7250
		],
		name: 'Human-Computer Interaction',
		prerequisites: [
			course:deco1400,
			'OR',
			course:csse1001,
			'OR',
			course:engg1001
		],
		sem_1: true,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'DECO2801',
		cp: 2,
		id: course:deco2801,
		incompatible: [
			course:deco7281
		],
		name: 'Human-Centred AI',
		prerequisites: [
			[
				course:csse1001,
				'OR',
				course:engg1001
			],
			'AND',
			course:deco1100
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'DECO2850',
		cp: 2,
		id: course:deco2850,
		incompatible: [
			course:deco2800,
			course:deco7290,
			course:deco7285
		],
		name: 'Design Computing 2 - Interaction Design',
		prerequisites: [
			course:deco1800
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'DECO3500',
		cp: 2,
		id: course:deco3500,
		incompatible: [
			course:comp3505,
			course:comp7705,
			course:deco7350
		],
		name: 'Social Mobile Computing',
		prerequisites: [
			[
				course:deco2500,
				'OR',
				course:deco7250
			],
			'AND',
			[
				course:csse1001,
				'OR',
				course:engg1001,
				'OR',
				course:csse7030
			]
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'DECO3801',
		cp: 2,
		id: course:deco3801,
		incompatible: [],
		name: 'Design Computing Studio 3 - Build',
		prerequisites: [
			course:csse2002,
			'AND',
			[
				course:infs1200,
				'OR',
				course:deco2300,
				'OR',
				course:comp2140,
				'OR',
				course:deco2500,
				'OR',
				course:deco3800
			]
		],
		sem_1: true,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'DECO3850',
		cp: 2,
		id: course:deco3850,
		incompatible: [
			course:deco7385
		],
		name: 'Physical Computing Studio',
		prerequisites: [
			course:deco2300,
			'AND',
			course:deco2500,
			'AND',
			[
				course:deco2800,
				'OR',
				course:deco2850,
				'OR',
				course:dsgn2100
			]
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'ENGG1300',
		cp: 2,
		id: course:engg1300,
		incompatible: [
			course:engg1030,
			course:engg1060,
			course:elec1000
		],
		name: 'Introduction to Electrical Systems',
		prerequisites: [
			course:math1040
		],
		sem_1: true,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'INFS1200',
		cp: 2,
		id: course:infs1200,
		incompatible: [
			course:infs7900,
			course:mgts3203,
			course:mgts7206,
			course:bism2207,
			course:bism3203,
			course:bism7206,
			course:infs7901
		],
		name: 'Introduction to Information Systems',
		prerequisites: [],
		sem_1: true,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'INFS2200',
		cp: 2,
		id: course:infs2200,
		incompatible: [
			course:bsis7206,
			course:comm7605,
			course:infs7903,
			course:infs7901
		],
		name: 'Relational Database Systems',
		prerequisites: [
			course:infs1200
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'INFS3200',
		cp: 2,
		id: course:infs3200,
		incompatible: [
			course:infs7907
		],
		name: 'Advanced Database Systems',
		prerequisites: [
			course:infs2200
		],
		sem_1: true,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'INFS3202',
		cp: 2,
		id: course:infs3202,
		incompatible: [
			course:infs7202
		],
		name: 'Web Information Systems',
		prerequisites: [
			[
				course:csse1001,
				'OR',
				course:engg1001
			],
			'AND',
			course:infs1200,
			'AND',
			course:deco1400
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'INFS3208',
		cp: 2,
		id: course:infs3208,
		incompatible: [
			course:infs3204,
			course:infs7204,
			course:infs7208
		],
		name: 'Cloud Computing',
		prerequisites: [
			course:csse1001,
			'AND',
			course:infs1200
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'INFS4203',
		cp: 2,
		id: course:infs4203,
		incompatible: [
			course:infs7203
		],
		name: 'Data Mining',
		prerequisites: [
			[
				course:csse1001,
				'OR',
				course:engg1001
			],
			'AND',
			course:infs2200
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'INFS4205',
		cp: 2,
		id: course:infs4205,
		incompatible: [
			course:infs4200,
			course:infs7200,
			course:infs7205
		],
		name: 'Advanced Techniques for High Dimensional Data',
		prerequisites: [
			[
				course:infs2200,
				'OR',
				course:infs7903
			],
			'AND',
			[
				course:comp3506,
				'OR',
				course:comp7505
			]
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'MATH1050',
		cp: 2,
		id: course:math1050,
		incompatible: [
			course:math1051,
			course:math1052,
			course:math7050
		],
		name: 'Mathematical Foundation II',
		prerequisites: [
			course:math1040
		],
		sem_1: true,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'MATH1051',
		cp: 2,
		id: course:math1051,
		incompatible: [
			course:math1071,
			course:math7051
		],
		name: 'Calculus and Linear Algebra I',
		prerequisites: [
			course:math1050
		],
		sem_1: true,
		sem_2: true,
		sem_summer: true
	},
	{
		code: 'MATH1052',
		cp: 2,
		id: course:math1052,
		incompatible: [
			course:math1072,
			course:math7052
		],
		name: 'Multivariate Calculus & Ordinary Differential Equations',
		prerequisites: [
			course:math1050
		],
		sem_1: true,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'MATH1061',
		cp: 2,
		id: course:math1061,
		incompatible: [
			course:math1081,
			course:math7861
		],
		name: 'Discrete Mathematics',
		prerequisites: [],
		sem_1: true,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'MATH1071',
		cp: 2,
		id: course:math1071,
		incompatible: [
			course:math1051,
			course:math7051,
			course:math7501
		],
		name: 'Advanced Calculus & Linear Algebra I',
		prerequisites: [
			course:math1050
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'MATH1072',
		cp: 2,
		id: course:math1072,
		incompatible: [
			course:math1052,
			course:math7052,
			course:math7502
		],
		name: 'Advanced Multivariate Calculus & Ordinary Differential Equations',
		prerequisites: [
			course:math1050
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'MATH1081',
		cp: 2,
		id: course:math1081,
		incompatible: [
			course:math1061,
			course:math7861
		],
		name: 'Advanced Discrete Mathematics',
		prerequisites: [],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'MATH2001',
		cp: 2,
		id: course:math2001,
		incompatible: [
			course:math2000,
			course:math2901,
			course:math7000
		],
		name: 'Calculus and Linear Algebra II',
		prerequisites: [
			[
				course:math1051,
				'OR',
				course:math1071
			],
			'AND',
			[
				course:math1052,
				'OR',
				course:math1072
			]
		],
		sem_1: true,
		sem_2: true,
		sem_summer: true
	},
	{
		code: 'MATH2301',
		cp: 2,
		id: course:math2301,
		incompatible: [
			course:math2300,
			course:math7307
		],
		name: 'Linear and Abstract Algebra & Number Theory',
		prerequisites: [
			[
				course:math1051,
				'OR',
				course:math1071
			],
			'AND',
			[
				course:math1061,
				'OR',
				course:math1081
			]
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'MATH2302',
		cp: 2,
		id: course:math2302,
		incompatible: [
			course:math2300,
			course:math7308
		],
		name: 'Discrete Mathematics II',
		prerequisites: [
			[
				course:math1061,
				'OR',
				course:math1081
			]
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'MATH2901',
		cp: 2,
		id: course:math2901,
		incompatible: [
			course:math2000,
			course:math7000,
			course:math2001
		],
		name: 'Advanced Calculus & Linear Algebra II',
		prerequisites: [
			[
				course:math1051,
				'OR',
				course:math1071
			],
			'AND',
			[
				course:math1052,
				'OR',
				course:math1072
			]
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'MATH3104',
		cp: 2,
		id: course:math3104,
		incompatible: [
			course:math7134
		],
		name: 'Mathematics Biology',
		prerequisites: [
			course:math2100
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'MATH3201',
		cp: 2,
		id: course:math3201,
		incompatible: [],
		name: 'Scientific Computing: Advanced Techniques and Applications',
		prerequisites: [
			[
				course:math2000,
				'OR',
				course:math2001
			],
			'AND',
			[
				course:cosc2500,
				'OR',
				course:math2100
			]
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'MATH3202',
		cp: 2,
		id: course:math3202,
		incompatible: [
			course:math7232
		],
		name: 'Operations Research & Mathematics Planning',
		prerequisites: [
			[
				course:math1051,
				'OR',
				course:math1071
			],
			'AND',
			[
				course:math1052,
				'OR',
				course:math1072
			]
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'MATH3302',
		cp: 2,
		id: course:math3302,
		incompatible: [
			course:math7332
		],
		name: 'Coding and Cryptography',
		prerequisites: [
			course:math2301
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'SCIE1000',
		cp: 2,
		id: course:scie1000,
		incompatible: [
			course:scie1100
		],
		name: 'Theory & Practice in Science',
		prerequisites: [],
		sem_1: true,
		sem_2: true,
		sem_summer: true
	},
	{
		code: 'SCIE2100',
		cp: 2,
		id: course:scie2100,
		incompatible: [
			course:cosc2000,
			course:binf6000
		],
		name: 'Bioinformatics 1: Introduction',
		prerequisites: [
			[
				course:scie1000,
				'AND',
				course:stat1201
			],
			'OR',
			[
				[
					course:math1051,
					'OR',
					course:math1071
				],
				course:csse1001
			]
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'STAT1201',
		cp: 2,
		id: course:stat1201,
		incompatible: [
			course:econ1301,
			course:envm2000,
			course:stat1301,
			course:stat2201,
			course:stat2203,
			course:stat2701,
			course:pubh2007,
			course:hrss3100,
			course:stat7120
		],
		name: 'Analysis of Scientific Data',
		prerequisites: [
			course:math1050
		],
		sem_1: true,
		sem_2: true,
		sem_summer: true
	},
	{
		code: 'STAT1301',
		cp: 2,
		id: course:stat1301,
		incompatible: [
			course:econ1310,
			course:envm2000,
			course:stat1201,
			course:stat2201,
			course:stat2203,
			course:stat2701,
			course:pubh2007,
			course:hrss3100,
			course:stat7120
		],
		name: 'Advanced Analysis of Scientific Data',
		prerequisites: [
			course:math1040
		],
		sem_1: true,
		sem_2: true,
		sem_summer: false
	},
	{
		code: 'STAT2003',
		cp: 2,
		id: course:stat2003,
		incompatible: [
			course:stat2001
		],
		name: 'Mathematical Probability',
		prerequisites: [
			[
				course:math1051,
				'OR',
				course:math1071
			]
		],
		sem_1: true,
		sem_2: false,
		sem_summer: false
	},
	{
		code: 'STAT2004',
		cp: 2,
		id: course:stat2004,
		incompatible: [
			course:stat2002,
			course:stat2904,
			course:stat7004
		],
		name: 'Statistical Modelling & Analysis',
		prerequisites: [
			[
				course:math1051,
				'OR',
				course:math1071
			],
			'AND',
			[
				course:stat1201,
				'OR',
				course:stat1301,
				'OR',
				course:stat2201
			],
			'AND',
			[
				course:stat2003,
				'OR',
				course:stat2203
			]
		],
		sem_1: false,
		sem_2: true,
		sem_summer: false
	}
]
