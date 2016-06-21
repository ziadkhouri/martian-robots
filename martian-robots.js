//Usage: node martian-robots.js < test.txt

//Grid------
function Grid (width, height)
{
	if (width > 50) width = 50;
	if (height > 50) height = 50;
	this.width = width;
	this.height = height;
	this.scents = [];
}

Grid.prototype.leaveScent = function (x, y)
{
	this.scents.push ((y * this.width) + x);
};

Grid.prototype.isScented = function (x, y)
{
	return (
		this.scents.indexOf ((y * this.width) + x)
		>= 0
		);
};

Grid.prototype.isUncharted = function (x, y)
{
		return (
			x < 0	
			|| y < 0
			|| x > this.width
			|| y > this.height
		)
};


//Robot------
function Robot (grid, x, y, orientation)
{
	this.grid = grid;
	this.x = x;
	this.y = y;
	this.orientation = 'NESW'.indexOf (orientation) % 4;
}

Robot.prototype.turnLeft = function ()
{
	//note: negative modulus is unusual in javascript
	this.orientation = ((--this.orientation % 4) + 4) % 4;
};

Robot.prototype.turnRight = function ()
{
	this.orientation = ++this.orientation % 4;
};

//returns 'false' if the robot is lost
Robot.prototype.moveForward = function ()
{
	var xVelocity = 0;
	var yVelocity = 0;

	if (this.orientation % 2 == 0)
		yVelocity = (this.orientation > 1) ? -1 : 1;
	else
		xVelocity = (this.orientation > 1) ? -1 : 1;

	if (this.grid.isUncharted (this.x + xVelocity, this.y + yVelocity))
	{
		if (!this.grid.isScented (this.x, this.y))
		{	
			this.grid.leaveScent (this.x, this.y);
			return false;
		}				
	}
	else
	{
		this.x += xVelocity;
		this.y += yVelocity;
	}

	return true;
};

//returns 'false' if the robot is lost
Robot.prototype.doCommand = function (command)
{
	switch (command)
	{
		case 'R':
			this.turnRight ();
			break
		case 'L':
			this.turnLeft ();
			break;
		case 'F':
			return this.moveForward ();
	}
	
	return true;
};

//returns 'false' if the robot is lost
Robot.prototype.processCommands = function (commands)
{
	for (var i = 0; i < commands.length; i++)
	{
		if (!this.doCommand (commands.charAt(i)))
			return false;
	}

	return true;
};

Robot.prototype.toString = function (){
	return this.x + ' ' 
		+ this.y + ' '
		+ 'NESW'.charAt (this.orientation);
};


//UI------
process.stdin.setEncoding ('utf8');
process.stdin.on ('data', 
	function (chunk)
	{
		var lines = chunk.split ('\n');
		var line = lines.shift ();
		var params = line.split (' ');

		var grid = new Grid (
						parseInt (params[0]), 
						parseInt (params[1])
						)
		var robot;

		while (lines.length > 0)
		{
			line = lines.shift();
			if (line.length > 1) //skip blank lines
			{
				params = line.split (' ');
				
				robot = new Robot (
							grid, 
							parseInt (params[0]), 
							parseInt (params[1]), 
							params[2].charAt(0)
							);

				line = lines.shift();

				if (robot.processCommands (line))
					process.stdout.write (robot + '\n');
				else
					process.stdout.write (robot + ' LOST\n');
			}
		}
		
	}
);
