#!/bin/sh

maxParam=""
if [ -f /proc/cpuinfo ] ; then
    cpus=`grep -c "^processor[[:space:]]*:" /proc/cpuinfo`
    if [ $cpus -gt 10 ] ; then
	maxParam="maxOptimizationProcesses=10"
    fi
fi

cd public/js/
./util/buildscripts/build.sh --profile ./release.profile.js --release  $maxParam

returnCode=$?;
if [[ $returnCode != 0 ]]; then
    exit $returnCode;
fi