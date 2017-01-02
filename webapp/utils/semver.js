function Version(major, minor, patch, prefix) {
    var self = this;
    self.prefix = prefix;

    self.major = parseInt(major);
    self.minor = parseInt(minor);
    self.patch = patch != undefined ? parseInt(patch) : undefined;

    self.toString = function() {
        return (
            (self.prefix ? self.prefix : '') +
            self.major + '.' + self.minor +
            (self.patch != undefined ? '.' + self.patch : '')
        )
    };

    self.copy = function() {
        return new Version(self.major, self.minor, self.patch, self.prefix);
    };

    self.nextMajor = function(save) {
        var version = save ? self : self.copy();
        version.major += 1;
        version.minor = 0;
        if(version.patch != undefined) {
            version.patch = 0;
        }
        return version.toString();
    };

    self.nextMinor = function(save) {
        var version = save ? self : self.copy();
        version.minor += 1;
        if(version.patch != undefined) {
            version.patch = 0;
        }
        return version.toString();
    };

    self.nextPatch = function(save) {
        var version = save ? self : self.copy();
        version.patch = version.patch != undefined ? version.patch + 1 : 1;
        return version.toString();
    };
}


function semver(tag) {
    var match = tag.match(/^(v|V)?(\d+)\.(\d+)(\.(\d+))?(-\D.*)?$/);
    if(!match) { return null; }
    return new Version(match[2], match[3], match[5], match[1]);
}